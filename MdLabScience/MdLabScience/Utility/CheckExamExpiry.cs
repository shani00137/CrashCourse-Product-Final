using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Utility
{
    public class AppUserValidation
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        public static bool CheckExamExpiry(DateTime startDateTime, int Duration,bool IsCompleted)
        {
            if (IsCompleted == false)
            {
                DateTime CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                double TotalMint = CurrentDateTime.Subtract(startDateTime).TotalMinutes;
                if (TotalMint >= Duration)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else
            {
                return true;
            }
           

               
            
        }
        public static bool CheckCourseExpire(DateTime startDateTime, DateTime EndDate, bool IsActive)
        {
            if (IsActive == true)
            {
                DateTime CurrentDateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);

                if (CurrentDateTime > EndDate)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            else

            {
                return true;
            }
           
        }

    }
}