using ContactManager.Application.Interfaces;
using ContactManager.Application.Dto;
using Microsoft.AspNetCore.Http;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace ContactManager.Application.Services
{
    public class CsvParserService : ICsvParser
    {
        public async Task<List<UploadContactDto>> Parse(IFormFile file)
        {
            if (file is null || file.Length == 0)
            {
                return new List<UploadContactDto>();
            }

            using var stream = file.OpenReadStream();
            using var reader = new StreamReader(stream);

            using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                TrimOptions = TrimOptions.Trim,
                IgnoreBlankLines = true
            });

            var result = new List<UploadContactDto>();

            await foreach (var contact in csv.GetRecordsAsync<UploadContactDto>())
            {
                result.Add(contact);
            }

            return result;
        }
    }
}
