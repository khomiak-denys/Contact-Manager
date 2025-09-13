using ContactManager.Application.Interfaces;
using ContactManager.Domain.Entities;
using ContactManager.Infrastructure.Database;
using ContactManager.Domain.Models;


namespace ContactManager.Infrastructure.Repositories
{
    public class MSContactRepository : IContactRepository
    {
        private readonly AppDbContext _dbContext;

        public MSContactRepository(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<long> AddRangeAsync(List<Contact> contacts)
        {
            _dbContext.Contacts.AddRange(contacts);
            await _dbContext.SaveChangesAsync();
            return contacts.Count;
        }
        public IEnumerable<Contact> GetContacts(GetContactsCriteria criteria)
        {
            return _dbContext.Contacts
                .Skip(criteria.Skip)
                .Take(criteria.Count)
                .ToList();
        }
        public Contact GetContactById(long id)
        {
            return _dbContext.Contacts.FirstOrDefault(c => c.Id == id);
        }
        public async Task<Contact> UpdateAsync(Contact contact)
        {
            var updatedContact = _dbContext.Contacts.Update(contact);
            await _dbContext.SaveChangesAsync();
            return updatedContact.Entity;
        }
        public async Task<bool> DeleteAsync(long id)
        {
            var contact = _dbContext.Contacts.FirstOrDefault(c => c.Id == id);
            _dbContext.Contacts.Remove(contact);
            await _dbContext.SaveChangesAsync();
            return true;
        }

    }
}
