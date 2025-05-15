using GameFundManager.Core.Entities;
using GameFundManager.Application.DTOs;

namespace GameFundManager.Application.Common;

public static class DateExtensions
{
    /// <summary>
    /// Gets the due day of the month from a group's DueDate property
    /// </summary>
    /// <param name="group">The group entity</param>
    /// <returns>Day of month (1-31) or null if DueDate is not set</returns>
    public static int? GetDueDay(this Group group)
    {
        if (group.DueDate.HasValue)
        {
            return group.DueDate.Value.Day;
        }
        return null;
    }
    
    /// <summary>
    /// Gets the next due date based on the current date and the due day
    /// </summary>
    /// <param name="group">The group entity</param>
    /// <returns>The next due date based on the current month or the following month</returns>
    public static DateTime? GetNextDueDate(this Group group)
    {
        if (!group.DueDate.HasValue)
        {
            return null;
        }
        
        int dueDay = group.DueDate.Value.Day;
        DateTime today = DateTime.Today;
        
        // If we're already past the due day in the current month, 
        // get the due date for next month
        if (today.Day > dueDay)
        {
            return new DateTime(today.Year, today.Month, 1).AddMonths(1).AddDays(dueDay - 1);
        }
        
        // Otherwise, use the due date of the current month
        return new DateTime(today.Year, today.Month, dueDay);
    }

    /// <summary>
    /// Enriches a GroupDto with contribution due date information
    /// </summary>
    /// <param name="dto">The group DTO to enrich</param>
    /// <param name="group">The source group entity</param>
    /// <returns>The enriched GroupDto</returns>
    public static GroupDto EnrichWithDueDateInfo(this GroupDto dto, Group group)
    {
        // Add the next contribution due date
        if (group.DueDate.HasValue)
        {
            // Add calculated properties for the client
            dto.ContributionDueDay = group.DueDate.Value.Day;
            dto.NextContributionDueDate = group.GetNextDueDate();
            
            // Format the due day as a string (e.g., "15th")
            string suffix = GetDaySuffix(dto.ContributionDueDay);
            dto.ContributionDueDayFormatted = $"{dto.ContributionDueDay}{suffix}";
        }
        
        return dto;
    }
    
    /// <summary>
    /// Gets the English ordinal suffix for a day number (1st, 2nd, 3rd, etc.)
    /// </summary>
    private static string GetDaySuffix(int? day)
    {
        if (!day.HasValue) return string.Empty;
        
        int value = day.Value;
        
        if (value >= 11 && value <= 13)
        {
            return "th";
        }
        
        switch (value % 10)
        {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }
}
