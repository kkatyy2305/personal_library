using Library.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Library.Api.Data
{
    public class LibraryContext : DbContext
    {
        public LibraryContext(DbContextOptions<LibraryContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books => Set<Book>();
    }
}
