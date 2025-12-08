using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Comment> Comments => Set<Comment>();
        public DbSet<ForumUser> ForumUsers => Set<ForumUser>();
        public DbSet<ForumThread> ForumThreads => Set<ForumThread>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Post>(entity =>
            {
                entity.Property(p => p.Title)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(p => p.Slug)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.HasIndex(p => p.Slug)
                      .IsUnique();
            });

            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.Content)
                      .HasMaxLength(2000)
                      .IsRequired();

                entity.Property(c => c.DisplayName)
                      .HasMaxLength(100);

                entity.Property(c => c.Email)
                      .HasMaxLength(256);

                entity.HasOne(c => c.Post)
                      .WithMany(p => p.Comments)
                      .HasForeignKey(c => c.PostId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ForumUser>(entity =>
            {
                entity.Property(u => u.UserName)
                      .HasMaxLength(32)
                      .IsRequired();

                entity.HasIndex(u => u.UserName)
                      .IsUnique();
            });

            modelBuilder.Entity<ForumThread>(entity =>
            {
                entity.Property(t => t.Title)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.Property(t => t.Slug)
                      .HasMaxLength(200)
                      .IsRequired();

                entity.HasIndex(t => t.Slug)
                      .IsUnique();

                entity.HasOne(t => t.ForumUser)
                      .WithMany(u => u.Threads)
                      .HasForeignKey(t => t.ForumUserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
