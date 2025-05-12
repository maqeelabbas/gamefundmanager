using GameFundManager.Application.DTOs;
using GameFundManager.Application.Interfaces;
using GameFundManager.Core.Entities;
using GameFundManager.API.Swagger;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using Swashbuckle.AspNetCore.Annotations;

namespace GameFundManager.API.Controllers
{
    [Authorize]
    public class ExpensesController : BaseApiController
    {
        private readonly IExpenseService _expenseService;

        public ExpensesController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        /// <summary>
        /// Get all expenses for a specific group
        /// </summary>
        /// <param name="groupId">Group ID to retrieve expenses for</param>
        /// <returns>List of expenses for the specified group</returns>
        [HttpGet("group/{groupId}")]
        [SwaggerOperation(
            Summary = "Get group expenses", 
            Description = "Returns all expenses for a specific group",
            OperationId = "GetGroupExpenses",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(200, "Group expenses retrieved successfully")]
        [SwaggerResponse(404, "Group not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> GetGroupExpenses(
            [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve expenses for")]
            Guid groupId)
        {
            var response = await _expenseService.GetGroupExpensesAsync(groupId);
            return HandleApiResponse(response);
        }

        /// <summary>
        /// Get expenses by status for a specific group
        /// </summary>
        /// <param name="groupId">Group ID to retrieve expenses for</param>
        /// <param name="status">Expense status to filter by</param>
        /// <returns>List of expenses with specified status</returns>
        [HttpGet("group/{groupId}/status/{status}")]
        [SwaggerOperation(
            Summary = "Get expenses by status", 
            Description = "Returns expenses for a specific group filtered by status (Pending, Approved, Rejected)",
            OperationId = "GetExpensesByStatus",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(200, "Filtered expenses retrieved successfully")]
        [SwaggerResponse(404, "Group not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> GetExpensesByStatus(
            [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Group ID to retrieve expenses for")]
            Guid groupId, 
            [SwaggerExample("Pending", "Expense status (Pending, Approved, or Rejected)")]
            ExpenseStatus status)
        {
            var response = await _expenseService.GetExpensesByStatusAsync(groupId, status);
            return HandleApiResponse(response);
        }

        /// <summary>
        /// Get a specific expense by ID
        /// </summary>
        /// <param name="id">Expense ID to retrieve</param>
        /// <returns>Details of the specified expense</returns>
        [HttpGet("{id}")]
        [SwaggerOperation(
            Summary = "Get expense by ID", 
            Description = "Returns detailed information about a specific expense",
            OperationId = "GetExpenseById",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(200, "Expense retrieved successfully")]
        [SwaggerResponse(404, "Expense not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> GetExpenseById(
            [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Expense ID to retrieve")]
            Guid id)
        {
            var response = await _expenseService.GetExpenseByIdAsync(id);
            return HandleApiResponse(response);
        }

        /// <summary>
        /// Create a new expense request
        /// </summary>
        /// <param name="expenseDto">Expense details</param>
        /// <returns>Created expense details</returns>
        [HttpPost]
        [SwaggerOperation(
            Summary = "Create expense request",
            Description = "Creates a new expense request for a group. By default, expenses are created with 'Pending' status.",
            OperationId = "CreateExpense",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(201, "Expense created successfully")]
        [SwaggerResponse(400, "Invalid expense information")]
        [SwaggerResponse(404, "Group not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> CreateExpense(
            [FromBody, SwaggerExample(
                "{\"groupId\":\"3fa85f64-5717-4562-b3fc-2c963f66afa6\",\"title\":\"New Crickets\",\"description\":\"Purchase of 5 new Crickets\",\"amount\":250.00,\"expenseDate\":\"2023-08-20T14:30:00\",\"receiptUrl\":\"https://example.com/receipt.jpg\",\"vendor\":\"Sports Store\"}", 
                "Expense details")]
            CreateExpenseDto expenseDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var response = await _expenseService.CreateExpenseAsync(expenseDto, userId);
            return HandleApiResponse(response);
        }

        /// <summary>
        /// Update the status of an expense
        /// </summary>
        /// <param name="id">Expense ID to update</param>
        /// <param name="status">New expense status</param>
        /// <returns>Updated expense details</returns>
        [HttpPut("{id}/status/{status}")]
        [SwaggerOperation(
            Summary = "Update expense status",
            Description = "Updates the status of an expense to Approved or Rejected. Only group admins can update expense status.",
            OperationId = "UpdateExpenseStatus",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(200, "Expense status updated successfully")]
        [SwaggerResponse(403, "Not authorized to update this expense")]
        [SwaggerResponse(404, "Expense not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> UpdateExpenseStatus(
            [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Expense ID to update")]
            Guid id, 
            [SwaggerExample("Approved", "New expense status (Approved or Rejected)")]
            ExpenseStatus status)
        {
            var userId = GetCurrentUserId();
            var response = await _expenseService.UpdateExpenseStatusAsync(id, status, userId);
            return HandleApiResponse(response);
        }

        /// <summary>
        /// Delete an expense
        /// </summary>
        /// <param name="id">Expense ID to delete</param>
        /// <returns>Success or failure message</returns>
        [HttpDelete("{id}")]
        [SwaggerOperation(
            Summary = "Delete expense",
            Description = "Deletes an expense request. Only the expense creator or a group admin can delete expenses.",
            OperationId = "DeleteExpense",
            Tags = new[] { "Expenses" }
        )]
        [SwaggerResponse(200, "Expense deleted successfully")]
        [SwaggerResponse(403, "Not authorized to delete this expense")]
        [SwaggerResponse(404, "Expense not found")]
        [SwaggerResponse(401, "Unauthorized access")]
        public async Task<IActionResult> DeleteExpense(
            [SwaggerExample("3fa85f64-5717-4562-b3fc-2c963f66afa6", "Expense ID to delete")]
            Guid id)
        {
            var userId = GetCurrentUserId();
            var response = await _expenseService.DeleteExpenseAsync(id, userId);
            return HandleApiResponse(response);
        }
    }
}
