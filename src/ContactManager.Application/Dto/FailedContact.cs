
namespace ContactManager.Application.Dto
{
    public class FailedContact
    {
        public long Row { get; set; }
        public List<string> Errors { get; set; }
    }
}
