using Microsoft.AspNetCore.Http;
using ContactManager.Application.Dto;

namespace ContactManager.Application.Interfaces
{
    public interface ICsvParser
    {
        public Task<List<UploadContactDto>> Parse(IFormFile file);
    }
}
