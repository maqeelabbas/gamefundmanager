using System;
using System.ComponentModel.DataAnnotations;

namespace GameFundManager.Application.DTOs
{
    public class PauseMemberContributionDto
    {
        [Required]
        public string MemberId { get; set; }
        
        [Required]
        public DateTime PauseStartDate { get; set; }
        
        [Required]
        public DateTime PauseEndDate { get; set; }
    }
}