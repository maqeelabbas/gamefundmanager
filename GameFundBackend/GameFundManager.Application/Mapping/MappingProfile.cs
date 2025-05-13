using AutoMapper;
using GameFundManager.Application.DTOs;
using GameFundManager.Core.Entities;

namespace GameFundManager.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<RegisterUserDto, User>();

            // Group mappings
            CreateMap<Group, GroupDto>()
                .ForMember(dest => dest.MemberCount, opt => opt.MapFrom(src => src.Members.Count))
                .ForMember(dest => dest.TotalContributions, opt => opt.Ignore())
                .ForMember(dest => dest.TotalExpenses, opt => opt.Ignore());
            CreateMap<CreateGroupDto, Group>();

            // GroupMember mappings
            CreateMap<GroupMember, GroupMemberDto>();
            CreateMap<AddGroupMemberDto, GroupMember>();

            // Contribution mappings
            CreateMap<Contribution, ContributionDto>();
            CreateMap<CreateContributionDto, Contribution>();            
            
            // Expense mappings
            CreateMap<CreateExpenseDto, Expense>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => ExpenseStatus.Proposed))
                .ForMember(dest => dest.PaidByUserId, opt => opt.MapFrom(src => src.PaidByUserId));
            
            CreateMap<Expense, ExpenseDto>()
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.PaidByUser, opt => opt.MapFrom(src => src.PaidByUser))
                .ForMember(dest => dest.CreatedByUser, opt => opt.MapFrom(src => src.CreatedByUser));

            // Poll mappings
            CreateMap<Poll, PollDto>()
                .ForMember(dest => dest.Options, opt => opt.MapFrom(src => src.Options))
                .ForMember(dest => dest.TotalVotes, opt => opt.MapFrom(src => src.Votes.Count));

            CreateMap<CreatePollDto, Poll>();

            // PollOption mappings
            CreateMap<PollOption, PollOptionDto>()
                .ForMember(dest => dest.VoteCount, opt => opt.MapFrom(src => src.Votes.Count))
                .ForMember(dest => dest.Percentage, opt => opt.Ignore());
        }
    }
}
