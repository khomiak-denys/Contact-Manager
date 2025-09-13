using ContactManager.Application.Dto;
using Microsoft.AspNetCore.Http;

namespace ContactManager.Application.Interfaces
{
    public interface IContactService
    {
        public Task<UploadResultDto> UploadAsync(IFormFile file);
        public Task<IEnumerable<ContactDto>> GetContactsAsync(GetContactsDto criteria);
        public Task<ContactDto> GetContactByIdAsync(long id);
        public Task<ContactDto> UpdateAsync(long id, UpdateContactDto contact);
        public Task<bool> DeleteAsync(long id);
    }
}
