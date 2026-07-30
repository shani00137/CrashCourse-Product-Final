using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotelManagement.Models
{
    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string UserToken { get; set; }
        public string DeviceId { get; set; }
        public Boolean IsValid { get; set; }
        public string Response { get; set; }
        public int AppUserId { get;  set; }
        public string Name { get;  set; }
        public string Mobile { get;  set; }
        public string Email { get;  set; }
        public object Address { get;  set; }
        public int ApplicantId { get;  set; }
    }
}