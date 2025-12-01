namespace Library.Api.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Author { get; set; } = null!;
        public string? CoverImageUrl { get; set; }
        public string Category { get; set; } = null!;
        public string Status { get; set; } = "ToRead";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
