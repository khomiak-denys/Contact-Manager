
namespace ContactManager.Application.Dto
{
    public class UploadResultDto
    {
        public long Total { get; set; }
        public long Readed { get; set; }
        public long Failed { get; set; }
        public List<FailedContact> FailedContacts { get; set; }
    }
}
