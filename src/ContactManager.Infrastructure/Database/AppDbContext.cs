using Microsoft.EntityFrameworkCore;
using ContactManager.Domain.Entities;

namespace ContactManager.Infrastructure.Database
{
    public class AppDbContext : DbContext
    {
        public DbSet<Contact> Contacts {  get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }
}
