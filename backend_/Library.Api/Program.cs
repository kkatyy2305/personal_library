using Library.Api.Data;
using Library.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<LibraryContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowAnyOrigin());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibraryContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/api/books", async (LibraryContext db) =>
    await db.Books.OrderByDescending(b => b.CreatedAt).ToListAsync());

app.MapPost("/api/books", async (LibraryContext db, Book book) =>
{
    book.CreatedAt = DateTime.UtcNow;
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created($"/api/books/{book.Id}", book);
});

app.MapDelete("/api/books/{id:int}", async (LibraryContext db, int id) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();
    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapPut("/api/books/{id:int}/status", async (LibraryContext db, int id, BookStatusUpdate update) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();
    book.Status = update.Status;
    await db.SaveChangesAsync();
    return Results.Ok(book);
});

app.Run();

record BookStatusUpdate(string Status);
