using System;

public class Share
{
    public Byte[] Preamble { get; set; }
    public Int32 Unknown1 { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public Byte[] Info { get; set; }
    public Byte[] Zeros { get; set; }
    public string Description { get; set; }
    public ShareDay[] Days { get; set; }
}