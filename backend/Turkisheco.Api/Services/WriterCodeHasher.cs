using System.Security.Cryptography;
using System.Text;

namespace Turkisheco.Api.Services
{
    public class WriterCodeHasher
    {
        private readonly string _pepper;

        public WriterCodeHasher(IConfiguration configuration)
        {
            _pepper = configuration["WriterAuth:CodePepper"]
                ?? configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("WriterAuth:CodePepper or Jwt:Key must be configured.");
        }

        public string HashCode(int writerId, string code)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_pepper));
            var bytes = Encoding.UTF8.GetBytes($"{writerId}:{code.Trim()}");
            return Convert.ToHexString(hmac.ComputeHash(bytes));
        }
    }
}
