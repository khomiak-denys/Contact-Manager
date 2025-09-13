using ContactManager.Application.Dto;
using ContactManager.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Text.RegularExpressions;
using ContactManager.Domain.Entities;
using ContactManager.Domain.Models;

namespace ContactManager.Application.Services
{
    public class ContactService : IContactService
    {
        private readonly IContactRepository _contactRepository;
        private readonly ICsvParser _csvParser;

        public ContactService(IContactRepository contactRepository, ICsvParser csvParser)
        {
            _contactRepository = contactRepository;
            _csvParser = csvParser;
        }

        public async Task<UploadResultDto> UploadAsync(IFormFile file)
        {
            var result = new UploadResultDto
            {
                Total = 0,
                Readed = 0,
                Failed = 0,
                FailedContacts = new List<FailedContact>()
            };

            var contacts = await _csvParser.Parse(file);

            var validContacts = new List<Contact>();

            foreach (var contact in contacts)
            {
                var errors = new List<string>();

                if (contact == null) continue;
                if (string.IsNullOrEmpty(contact.Name) || !Regex.IsMatch(contact.Name, @"^[A-Za-z\s]+$"))
                {
                    errors.Add("Invalid name");
                }
                if (contact.DateOfBirth > DateTime.Today)
                {
                    errors.Add("Invalid date of birth");
                }

                if (!Regex.IsMatch(contact.Phone, @"^\+?\d{7,15}$"))
                {
                    errors.Add("Invalid phone number");
                }
                if (contact.Salary < 0)
                {
                    errors.Add("Invalid salary");
                }

                result.Total++;

                if (errors.Count != 0)
                {
                    result.Failed++;
                    result.FailedContacts.Add(new FailedContact
                    {
                        Row = result.Total,
                        Errors = errors
                    });
                    continue;
                }
                validContacts.Add(new Contact
                {
                    Name = contact.Name,
                    DateOfBirth = contact.DateOfBirth,
                    Married = contact.Married,
                    Phone = contact.Phone,
                    Salary = contact.Salary
                });
            }

            await _contactRepository.AddRangeAsync(validContacts);

            result.Readed = validContacts.Count;
            return result;
        }
        public async Task<IEnumerable<ContactDto>> GetContactsAsync(GetContactsDto getContactsDto)
        {
            var criteria = new GetContactsCriteria
            {
                Skip = (getContactsDto.Page - 1) * getContactsDto.PageSize,
                Count = getContactsDto.PageSize
            };
            var contacts = _contactRepository.GetContacts(criteria);
            return contacts.Select(c => new ContactDto
            {
                Id = c.Id,
                Name = c.Name,
                DateOfBirth = c.DateOfBirth,
                Married = c.Married,
                Phone = c.Phone,
                Salary = c.Salary
            });
        }
        public async Task<ContactDto> GetContactByIdAsync(long id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Invalid id");
            }
            var contact = _contactRepository.GetContactById(id);

            if (contact == null)
            {
                throw new ArgumentNullException(nameof(contact));
            }
            return new ContactDto
            {
                Id = contact.Id,
                Name = contact.Name,
                DateOfBirth = contact.DateOfBirth,
                Married = contact.Married,
                Phone = contact.Phone,
                Salary = contact.Salary
            };
        }
        public async Task<ContactDto> UpdateAsync(long id, UpdateContactDto contact)
        {
            if (id < 0)
            {
                throw new ArgumentException("Invalid id");
            }
            if (contact == null)
            {
                throw new ArgumentNullException(nameof(contact));
            }
            var existingContact = _contactRepository.GetContactById(id);
            if (existingContact == null)
            {
                throw new KeyNotFoundException(nameof(contact));
            }

            if (!string.IsNullOrEmpty(contact.Name))
            {
                if (!Regex.IsMatch(contact.Name, @"^[A-Za-z\s]+$")) {
                    throw new ArgumentException("Invalid name");
                }
                existingContact.Name = contact.Name;
            }

            if (contact.DateOfBirth.HasValue)
            {
                if (contact.DateOfBirth > DateTime.Today)
                {
                    throw new ArgumentException("Invalid birthday");
                }
                existingContact.DateOfBirth = contact.DateOfBirth.Value;
            }

            if (contact.Married.HasValue)
            {
                existingContact.Married = contact.Married.Value;
            }

            if (!string.IsNullOrEmpty(contact.Phone))
            {
                if (!Regex.IsMatch(contact.Phone, @"^\+?\d{7,15}$"))
                {
                    throw new ArgumentException("Invalid number");
                }
                existingContact.Phone = contact.Phone;
            }

            if (contact.Salary.HasValue)
            {
                if(contact.Salary <= 0)
                {
                    throw new ArgumentException("Invalid salary");
                }
                existingContact.Salary = contact.Salary.Value;
            }

            var updatedContact = await _contactRepository.UpdateAsync(existingContact);

            return new ContactDto
            {
                Id = updatedContact.Id,
                Name = updatedContact.Name,
                DateOfBirth = updatedContact.DateOfBirth,
                Married = updatedContact.Married,
                Phone = updatedContact.Phone,
                Salary = updatedContact.Salary
            };

        }
        public async Task<bool> DeleteAsync(long id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("Invalid id");
            }
            var contact = _contactRepository.GetContactById(id);

            if (contact == null)
            {
                throw new KeyNotFoundException(nameof(contact));
            }
            return await _contactRepository.DeleteAsync(id);
        }

    }
}
