using AutoMapper;
using GameFundManager.Application.Common;
using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.Core.Interfaces;

namespace GameFundManager.Application.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly IGroupRepository _groupRepository;
        private readonly IMapper _mapper;

        public ExpenseService(
            IExpenseRepository expenseRepository,
            IGroupRepository groupRepository,
            IMapper mapper)
        {
            _expenseRepository = expenseRepository;
            _groupRepository = groupRepository;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesAsync(Guid groupId)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);

            if (group == null)
                return ApiResponse<IEnumerable<ExpenseDto>>.FailureResponse("Group not found");

            var expenses = await _groupRepository.GetGroupExpensesAsync(groupId);
            var expenseDtos = _mapper.Map<IEnumerable<ExpenseDto>>(expenses);

            return ApiResponse<IEnumerable<ExpenseDto>>.SuccessResponse(expenseDtos);
        }

        public async Task<ApiResponse<IEnumerable<ExpenseDto>>> GetExpensesByStatusAsync(Guid groupId, ExpenseStatus status)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);

            if (group == null)
                return ApiResponse<IEnumerable<ExpenseDto>>.FailureResponse("Group not found");

            var expenses = await _expenseRepository.GetExpensesByStatusAsync(groupId, status);
            var expenseDtos = _mapper.Map<IEnumerable<ExpenseDto>>(expenses);

            return ApiResponse<IEnumerable<ExpenseDto>>.SuccessResponse(expenseDtos);
        }

        public async Task<ApiResponse<ExpenseDto>> GetExpenseByIdAsync(Guid id)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Expense not found");

            var expenseDto = _mapper.Map<ExpenseDto>(expense);
            return ApiResponse<ExpenseDto>.SuccessResponse(expenseDto);
        }

        public async Task<ApiResponse<ExpenseDto>> CreateExpenseAsync(CreateExpenseDto expenseDto, Guid userId)
        {
            // Check if group exists
            var group = await _groupRepository.GetGroupWithMembersAsync(expenseDto.GroupId);

            if (group == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Group not found");

            // Check if user is a member of the group
            var isMember = group.Members.Any(m => m.UserId == userId && m.IsActive);

            if (!isMember)
                return ApiResponse<ExpenseDto>.FailureResponse("You are not a member of this group");

            // Create expense entity
            var expense = _mapper.Map<Expense>(expenseDto);
            expense.CreatedByUserId = userId;

            // If no PaidByUserId is provided, default to the creator
            if (expense.PaidByUserId == null || expense.PaidByUserId == Guid.Empty)
            {
                expense.PaidByUserId = userId;
            }
            else
            {
                // Verify that the PaidByUserId belongs to a group member
                var isPaidByMember = group.Members.Any(m => m.UserId == expense.PaidByUserId && m.IsActive);
                if (!isPaidByMember)
                    return ApiResponse<ExpenseDto>.FailureResponse("The person marked as paying for the expense is not an active member of the group");
            }

            expense.Status = ExpenseStatus.Proposed;

            await _expenseRepository.AddAsync(expense);
            await _expenseRepository.SaveChangesAsync();

            var result = _mapper.Map<ExpenseDto>(expense);
            return ApiResponse<ExpenseDto>.SuccessResponse(result, "Expense added successfully");
        }

        public async Task<ApiResponse<ExpenseDto>> UpdateExpenseAsync(Guid id, CreateExpenseDto expenseDto, Guid userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Expense not found");

            // Check if user is the expense creator, group owner, or admin
            var group = await _groupRepository.GetGroupWithMembersAsync(expense.GroupId);

            if (group == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Group not found");

            var isAuthorized = expense.CreatedByUserId == userId ||
                               group.OwnerId == userId ||
                               group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);

            if (!isAuthorized)
                return ApiResponse<ExpenseDto>.FailureResponse("You don't have permission to update this expense");

            // Check if the target group is the same as the existing group
            if (expense.GroupId != expenseDto.GroupId)
            {
                // Check if the new group exists and if the user is a member of it
                var newGroup = await _groupRepository.GetGroupWithMembersAsync(expenseDto.GroupId);
                if (newGroup == null)
                    return ApiResponse<ExpenseDto>.FailureResponse("Target group not found");                var isTargetGroupMember = newGroup.Members.Any(m => m.UserId == userId && m.IsActive);
                if (!isTargetGroupMember)
                    return ApiResponse<ExpenseDto>.FailureResponse("You are not a member of the target group");
            }
            
            // If PaidByUserId is provided, check if the user is a member of the group
            if (expenseDto.PaidByUserId != null && expenseDto.PaidByUserId != Guid.Empty)
            {
                var paidByGroup = expense.GroupId != expenseDto.GroupId
                    ? await _groupRepository.GetGroupWithMembersAsync(expenseDto.GroupId)
                    : group;

                if (paidByGroup == null)
                    return ApiResponse<ExpenseDto>.FailureResponse("Target group not found");

                var isPaidByMember = paidByGroup.Members.Any(m => m.UserId == expenseDto.PaidByUserId && m.IsActive);
                if (!isPaidByMember)
                    return ApiResponse<ExpenseDto>.FailureResponse("The person marked as paying for the expense is not an active member of the group");
            }
            else
            {
                // If no PaidByUserId is provided, keep existing value or default to the current user
                expenseDto.PaidByUserId = expense.PaidByUserId != Guid.Empty ? expense.PaidByUserId : userId;
            }

            // Update expense properties
            expense.Title = expenseDto.Title;
            expense.Description = expenseDto.Description;
            expense.Amount = expenseDto.Amount;
            expense.ExpenseDate = expenseDto.ExpenseDate;
            expense.GroupId = expenseDto.GroupId;
            expense.PaidByUserId = expenseDto.PaidByUserId;
            expense.ReceiptUrl = expenseDto.ReceiptUrl ?? expense.ReceiptUrl; // Don't overwrite with null

            await _expenseRepository.UpdateAsync(expense);
            await _expenseRepository.SaveChangesAsync();

            var result = _mapper.Map<ExpenseDto>(expense);
            return ApiResponse<ExpenseDto>.SuccessResponse(result, "Expense updated successfully");
        }

        public async Task<ApiResponse<ExpenseDto>> UpdateExpenseStatusAsync(Guid id, ExpenseStatus status, Guid userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Expense not found");

            // Check if user is the group owner or admin
            var group = await _groupRepository.GetGroupWithMembersAsync(expense.GroupId);

            if (group == null)
                return ApiResponse<ExpenseDto>.FailureResponse("Group not found");

            var isAuthorized = group.OwnerId == userId ||
                               group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);

            if (!isAuthorized)
                return ApiResponse<ExpenseDto>.FailureResponse("You don't have permission to update this expense");

            // Update status
            expense.Status = status;

            await _expenseRepository.UpdateAsync(expense);
            await _expenseRepository.SaveChangesAsync();

            var expenseDto = _mapper.Map<ExpenseDto>(expense);
            return ApiResponse<ExpenseDto>.SuccessResponse(expenseDto, $"Expense status updated to {status}");
        }

        public async Task<ApiResponse<bool>> DeleteExpenseAsync(Guid id, Guid userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);

            if (expense == null)
                return ApiResponse<bool>.FailureResponse("Expense not found");

            // Check if user is the creator, group owner, or admin
            if (expense.CreatedByUserId != userId)
            {
                var group = await _groupRepository.GetGroupWithMembersAsync(expense.GroupId);

                if (group == null)
                    return ApiResponse<bool>.FailureResponse("Group not found");

                var isAuthorized = group.OwnerId == userId ||
                                  group.Members.Any(m => m.UserId == userId && m.IsAdmin && m.IsActive);

                if (!isAuthorized)
                    return ApiResponse<bool>.FailureResponse("You don't have permission to delete this expense");
            }

            await _expenseRepository.DeleteAsync(id);
            await _expenseRepository.SaveChangesAsync();

            return ApiResponse<bool>.SuccessResponse(true, "Expense deleted successfully");
        }

        public async Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesByUserAsync(Guid groupId, Guid userId)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);

            if (group == null)
                return ApiResponse<IEnumerable<ExpenseDto>>.FailureResponse("Group not found");

            var expenses = await _expenseRepository.GetGroupExpensesByUserAsync(groupId, userId);
            var expenseDtos = _mapper.Map<IEnumerable<ExpenseDto>>(expenses);

            return ApiResponse<IEnumerable<ExpenseDto>>.SuccessResponse(expenseDtos);
        }

        public async Task<ApiResponse<IEnumerable<ExpenseDto>>> GetGroupExpensesByUserAndStatusAsync(Guid groupId, Guid userId, ExpenseStatus status)
        {
            var group = await _groupRepository.GetByIdAsync(groupId);

            if (group == null)
                return ApiResponse<IEnumerable<ExpenseDto>>.FailureResponse("Group not found");

            var expenses = await _expenseRepository.GetGroupExpensesByUserAndStatusAsync(groupId, userId, status);
            var expenseDtos = _mapper.Map<IEnumerable<ExpenseDto>>(expenses);

            return ApiResponse<IEnumerable<ExpenseDto>>.SuccessResponse(expenseDtos);
        }
    }
}
