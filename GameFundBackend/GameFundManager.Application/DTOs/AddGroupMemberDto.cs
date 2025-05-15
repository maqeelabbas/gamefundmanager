using System;
using System.ComponentModel.DataAnnotations;

namespace GameFundManager.Application.DTOs
{
    public class AddGroupMemberDto
    {
        [Required]
        public Guid UserId { get; set; }
        
        public bool IsAdmin { get; set; } = false;
        
        public DateTime? ContributionStartDate { get; set; } = DateTime.Now;
    }
}