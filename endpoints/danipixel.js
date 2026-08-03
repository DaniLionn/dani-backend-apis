module.exports = {
  "get/danipixel/timeticks": function (req, res) {

    const options = {
      timeZone: "America/Edmonton",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format
    };

    const hours = {
      0: 18000,
      1: 19000,
      2: 20000,
      3: 21000,
      4: 22000,
      5: 23000,
      6: 0,
      7: 1000,
      8: 2000,
      9: 3000,
      10: 4000,
      11: 5000,
      12: 6000,
      13: 7000,
      14: 8000,
      15: 9000,
      16: 10000,
      17: 11000,
      18: 12000,
      19: 13000,
      20: 14000,
      21: 15000,
      22: 16000,
      23: 17000,
    };

const date = new Date();
    const time = date.toLocaleTimeString("en-US", options);

    res.send(time)




  }
}