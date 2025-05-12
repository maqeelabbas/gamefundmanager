using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;

namespace GameFundManager.Application.Services
{
    public class PollService : IPollService
    {
        private readonly IPollRepository _pollRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;

        public PollService(
            IPollRepository pollRepository,
            IGroupRepository groupRepository,
            IMapper mapper)
        {
            _pollRepository = pollRepository;
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<PollDto>>> GetGroupPollsAsync(Guid groupId)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);
            
            if (group == null)
                return ApiResponse<IEnumerable<PollDto>>.FailureResponse("Group not found");
                
            // Get all polls for this group
            var polls = await _pollRepository.FindAsync(p => p.GroupId == groupId);
            
            // Get full details for each poll
            var pollDtos = new List<PollDto>();
            
            foreach (var poll in polls)
            {
                var pollWithOptions = await _pollRepository.GetPollWithOptionsAsync(poll.Id);
                var pollDto = _mapper.Map<PollDto>(pollWithOptions);
                
                // Calculate percentages
                if (pollDto.TotalVotes > 0)
                {
                    foreach (var option in pollDto.Options)
                    {
                        option.Percentage = (double)option.VoteCount / pollDto.TotalVotes * 100;
                    }
                }
                
                pollDtos.Add(pollDto);
            }
            
            return ApiResponse<IEnumerable<PollDto>>.SuccessResponse(pollDtos);
        }

        public async Task<ApiResponse<PollDto>> GetPollByIdAsync(Guid id)
        {
            var poll = await _pollRepository.GetPollWithOptionsAsync(id);
            
            if (poll == null)
                return ApiResponse<PollDto>.FailureResponse("Poll not found");
                
            var pollDto = _mapper.Map<PollDto>(poll);
            
            // Calculate percentages
            if (pollDto.TotalVotes > 0)
            {
                foreach (var option in pollDto.Options)
                {
                    option.Percentage = (double)option.VoteCount / pollDto.TotalVotes * 100;
                }
            }
            
            return ApiResponse<PollDto>.SuccessResponse(pollDto);
        }

        public async Task<ApiResponse<PollDto>> CreatePollAsync(CreatePollDto pollDto, Guid userId)
        {
            // Check if group exists
            var group = await _groupRepository.GetGroupWithMembersAsync(pollDto.GroupId);
            
            if (group == null)
                return ApiResponse<PollDto>.FailureResponse("Group not found");
                
            // Check if user is a member of the group
            var isMember = group.Members.Any(m => m.UserId == userId && m.IsActive);
            
            if (!isMember)
                return ApiResponse<PollDto>.FailureResponse("You are not a member of this group");
                
            // Check if poll has options
            if (pollDto.Options == null || !pollDto.Options.Any() || pollDto.Options.Count < 2)
                return ApiResponse<PollDto>.FailureResponse("Poll must have at least 2 options");
                
            // Create poll entity
            var poll = _mapper.Map<Poll>(pollDto);
            poll.CreatedByUserId = userId;
            
            // Add options
            foreach (var optionText in pollDto.Options)
            {
                poll.Options.Add(new PollOption
                {
                    Text = optionText,
                    PollId = poll.Id
                });
            }
            
            await _pollRepository.AddAsync(poll);
            await _pollRepository.SaveChangesAsync();
            
            // Get full details of created poll
            var createdPoll = await _pollRepository.GetPollWithOptionsAsync(poll.Id);
            var result = _mapper.Map<PollDto>(createdPoll);
            
            return ApiResponse<PollDto>.SuccessResponse(result, "Poll created successfully");
        }

        public async Task<ApiResponse<PollDto>> SubmitVoteAsync(SubmitPollVoteDto voteDto, Guid userId)
        {
            // Check if poll exists
            var poll = await _pollRepository.GetPollWithOptionsAsync(voteDto.PollId);
            
            if (poll == null)
                return ApiResponse<PollDto>.FailureResponse("Poll not found");
                
            // Check if poll is active
            if (!poll.IsActive)
                return ApiResponse<PollDto>.FailureResponse("This poll is no longer active");
                
            // Check if poll has expired
            if (poll.ExpiryDate < DateTime.UtcNow)
                return ApiResponse<PollDto>.FailureResponse("This poll has expired");
                
            // Check if user is a member of the group
            var group = await _groupRepository.GetGroupWithMembersAsync(poll.GroupId);
            var isMember = group?.Members.Any(m => m.UserId == userId && m.IsActive) ?? false;
            
            if (!isMember)
                return ApiResponse<PollDto>.FailureResponse("You are not a member of this group");
                
            // Check if user has already voted
            var hasVoted = await _pollRepository.HasUserVotedAsync(voteDto.PollId, userId);
            
            if (hasVoted)
                return ApiResponse<PollDto>.FailureResponse("You have already voted in this poll");
                
            // Check if option exists
            var option = poll.Options.FirstOrDefault(o => o.Id == voteDto.OptionId);
            
            if (option == null)
                return ApiResponse<PollDto>.FailureResponse("Poll option not found");
                
            // Create vote
            var vote = new PollVote
            {
                PollId = voteDto.PollId,
                PollOptionId = voteDto.OptionId,
                UserId = userId
            };
            
            poll.Votes.Add(vote);
            await _pollRepository.SaveChangesAsync();
            
            // Get updated poll with all votes
            var updatedPoll = await _pollRepository.GetPollWithOptionsAsync(voteDto.PollId);
            var pollDto = _mapper.Map<PollDto>(updatedPoll);
            
            // Calculate percentages
            if (pollDto.TotalVotes > 0)
            {
                foreach (var opt in pollDto.Options)
                {
                    opt.Percentage = (double)opt.VoteCount / pollDto.TotalVotes * 100;
                }
            }
            
            return ApiResponse<PollDto>.SuccessResponse(pollDto, "Vote submitted successfully");
        }

        public async Task<ApiResponse<bool>> DeletePollAsync(Guid id, Guid userId)
        {
            var poll = await _pollRepository.GetByIdAsync(id);
            
            if (poll == null)
                return ApiResponse<bool>.FailureResponse("Poll not found");
                
            // Check if user is the creator or group owner/admin
            if (poll.CreatedByUserId != userId)
            {
                var group = await _groupRepository.GetGroupWithMembersAsync(poll.GroupId);
                
                if (group == null)
                    return ApiResponse<bool>.FailureResponse("Group not found");
                    
                var isAuthorized = group.OwnerId == userId ||
                                  group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);
                                  
                if (!isAuthorized)
                    return ApiResponse<bool>.FailureResponse("You don't have permission to delete this poll");
            }
            
            await _pollRepository.DeleteAsync(id);
            await _pollRepository.SaveChangesAsync();
            
            return ApiResponse<bool>.SuccessResponse(true, "Poll deleted successfully");
        }
    }
}
