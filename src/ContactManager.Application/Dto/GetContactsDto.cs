using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace ContactManager.Application.Dto
{
    public class GetContactsDto
    {
        [Required]
        [DefaultValue(1)]
        [Range(0, int.MaxValue)]
        public int Page {  get; set; }

        [Required]
        [DefaultValue(1)]
        [Range(0, int.MaxValue)]
        public int PageSize { get; set; }
    }
}
