using System;
using System.Collections.Generic;
using EMCQWebApi.Models;

namespace MdLabScience.Models
{
    public class PdfOcrRequest
    {
        public string ImageBase64 { get; set; }
        public string FileName { get; set; }
    }

    public class PdfOcrPageResult
    {
        public int PageNumber { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string Text { get; set; }
    }

    public class PdfOcrResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; }
        public string FullText { get; set; }
        public List<PdfOcrPageResult> Pages { get; set; }
    }

    public class ParseOcrRequest
    {
        public string OcrText { get; set; }
        public int CourseId { get; set; }
    }

    public class ParsedQuestionItem
    {
        public string QuestionContent { get; set; }
        public List<ParsedQuestionOption> Options { get; set; }
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; }
    }

    public class ParsedQuestionOption
    {
        public string Text { get; set; }
    }

    public class ParseOcrResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; }
        public List<ParsedQuestionItem> Questions { get; set; }
    }

    public class BulkSaveRequest
    {
        public int CourseId { get; set; }
        public List<QuestionMD> Questions { get; set; }
    }

    public class GenerateAiRequest
    {
        public int CourseId { get; set; }
        public int Count { get; set; }
        public string Difficulty { get; set; }
        public bool UseDatabase { get; set; }
        public string Prompt { get; set; }
        public int? TopId { get; set; }
        public string TopTitle { get; set; }
    }

    public class GenerateAiQuestionItem
    {
        public string QuestionContent { get; set; }
        public List<GenerateAiOptionItem> Options { get; set; }
        public int CorrectIndex { get; set; }
        public string Explanation { get; set; }
    }

    public class GenerateAiOptionItem
    {
        public string Text { get; set; }
    }

    public class GenerateAiResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; }
        public List<GenerateAiQuestionItem> Questions { get; set; }
    }
}
