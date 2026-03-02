// =============================================================================
// IScream — Repository DI Extension
// =============================================================================
#nullable enable

using Microsoft.Extensions.DependencyInjection;

namespace IScream.Data
{
    public static class RepositoryExtensions
    {
        public static IServiceCollection AddAppRepository(this IServiceCollection services, string connectionString)
        {
            services.AddSingleton<IAppRepository>(_ => new SqlAppRepository(connectionString));
            return services;
        }
    }
}
