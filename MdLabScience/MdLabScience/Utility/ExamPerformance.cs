using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Utility
{
    public class ExamPerformance
    {
        public static String GetRemarks(int TotalQuestions, int RightAns)
        {
            double value =(double.Parse( RightAns.ToString())  /double.Parse( TotalQuestions.ToString()));
            double Percentage = value * 100;
            String Remarks = "";
            if (Percentage >= 1 && Percentage <= 20)
            {
                Remarks = "Poor.";
            }
            if (Percentage >= 20 && Percentage <= 30)
            {
                Remarks = "Satisfactory.";
            }
            if (Percentage >= 30 && Percentage <= 50)
            {
                Remarks = "Good.";
            }
            if (Percentage >= 50 && Percentage <= 70)
            {
                Remarks = "Very Good.";
            }
            if (Percentage >= 70 && Percentage <= 90)
            {
                Remarks = "Excellent.";
            }
            if (Percentage >= 90 && Percentage <= 101)
            {
                Remarks = "Super.";
            }
            if (Percentage ==0)
            {
                Remarks = "Failed.";
            }
            return Remarks;
        }
        public static double GetPercentage(int TotalQuestions, int RightAns)
        {
            double Percentage = RightAns / TotalQuestions * 100;
        
            return Percentage;
        }
    }
}