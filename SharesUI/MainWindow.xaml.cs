using System.Diagnostics;
using System.Linq;
using System.Windows;

namespace SharesUI
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();

            var prototypeParser = new PrototypeEodParser();
            Data.Text = prototypeParser.ParseFile();

            var eod = new EodParser();
            var csv = new CsvParser();

            var share = eod.ParseFile("NAB.EOD");
            var csvShare = csv.ParseFile("nab.csv");

            foreach (var pair in share.Days.Zip(csvShare.Days, (day, dayCsv) => new { Day = day, DayCsv = dayCsv }))
            {
                var day = pair.Day;
                var csvDay = pair.DayCsv;

                Debug.Assert(day.Date == csvDay.Date);
                Debug.Assert(day.Open == csvDay.Open);
                Debug.Assert(day.High == csvDay.High);
                Debug.Assert(day.Low == csvDay.Low);
                Debug.Assert(day.Close == csvDay.Close);
                Debug.Assert(day.Volume == csvDay.Volume);
                Debug.Assert(day.OpenInt == csvDay.OpenInt);
            }
        }
    }
}