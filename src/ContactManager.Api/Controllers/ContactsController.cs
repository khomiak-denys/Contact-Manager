using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using ContactManager.Application.Interfaces;
using ContactManager.Application.Dto;

namespace ContactManager.Api.Controllers
{
    [ApiController]
    [Route("contact-manager/api/contracts")]
    public class ContactsController : ControllerBase
    {
        private readonly IContactService _contactService;

        public ContactsController(IContactService contactService)
        {
            _contactService = contactService;
        }
        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            var result = await _contactService.UploadAsync(file);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetContactsAsync([FromQuery] GetContactsDto getContactsDto)
        {
            var contacts = await _contactService.GetContactsAsync(getContactsDto);
            return Ok(contacts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetContactByIdAsync(long id)
        {
            var contact = await _contactService.GetContactByIdAsync(id);
            return Ok(contact);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateAsync(long id, UpdateContactDto contact)
        {
            var updatedContact = await _contactService.UpdateAsync(id, contact);
            return Ok(updatedContact);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(long id)
        {
            await _contactService.DeleteAsync(id);
            return NoContent();
        }
    }
}
