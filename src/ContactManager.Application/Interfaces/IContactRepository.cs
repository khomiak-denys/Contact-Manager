
using ContactManager.Domain.Entities;
using ContactManager.Domain.Models;

namespace ContactManager.Application.Interfaces
{
    public interface IContactRepository
    {
        public Task<long> AddRangeAsync(List<Contact> contacts)  ;
        public IEnumerable<Contact> GetContacts(GetContactsCriteria criteria);
        public Contact GetContactById(long id);
        public Task<Contact> UpdateAsync(Contact contact);
        public Task<bool> DeleteAsync(long id);
    }
}
