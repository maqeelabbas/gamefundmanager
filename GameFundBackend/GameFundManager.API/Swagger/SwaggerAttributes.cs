using System;

namespace GameFundManager.API.Swagger
{
    /// <summary>
    /// Attribute for adding example values to parameters and request bodies in Swagger
    /// </summary>
    [AttributeUsage(AttributeTargets.Parameter)]
    public class SwaggerExampleAttribute : Attribute
    {
        public string Example { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public SwaggerExampleAttribute(string example, string? description = null)
        {
            Example = example;
            Description = description;
        }
    }
    
    /// <summary>
    /// Attribute for adding example values to responses in Swagger
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class SwaggerResponseExampleAttribute : Attribute
    {
        public int StatusCode { get; set; }
        public string Example { get; set; } = string.Empty;
        
        public SwaggerResponseExampleAttribute(int statusCode, string example)
        {
            StatusCode = statusCode;
            Example = example;
        }
    }
}
