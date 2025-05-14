using GameFundManager.Application.Interfaces;
using GameFundManager.Application.Services;
using GameFundManager.Core.Interfaces;
using GameFundManager.Infrastructure.Data;
using GameFundManager.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace GameFundManager.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {            // Add AutoMapper
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        // Register application services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IGroupService, GroupService>();
        services.AddScoped<IContributionService, ContributionService>();
        services.AddScoped<IExpenseService, ExpenseService>();
        services.AddScoped<IPollService, PollService>();
        
        return services;
    }
    
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly("GameFundManager.Infrastructure")));
        
        // Register repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IContributionRepository, ContributionRepository>();
        services.AddScoped<IExpenseRepository, ExpenseRepository>();
        services.AddScoped<IPollRepository, PollRepository>();
        
        return services;
    }
}
