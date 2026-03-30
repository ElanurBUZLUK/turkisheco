using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Turkisheco.Api.Entities;

namespace Turkisheco.Api.Controllers
{
    [ApiController]
    [Route("api/forum/users")]
    public class ForumUsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ForumUsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ForumUser>>> GetAll()
        {
            var users = await _context.ForumUsers
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ForumUser>> GetById(int id)
        {
            var user = await _context.ForumUsers.FindAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

    }
}
