const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.generateTicketPDF = (booking, passengers) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filePath = `tickets/ticket_${booking._id}.pdf`;

      doc.pipe(fs.createWriteStream(filePath));
      doc.fontSize(20).text("RailBook Train Ticket", { align: "center" });

      doc.moveDown();
      doc.fontSize(14).text(`Booking ID: ${booking._id}`);
      doc.text(`Train: ${booking.train}`);
      doc.text(`Date: ${booking.date}`);
      doc.text(`Seats: ${booking.seats.join(", ")}`);

      doc.moveDown().text("Passengers:");
      passengers.forEach((p, i) => {
        doc.text(`${i + 1}. ${p.name}, Age: ${p.age}, Gender: ${p.gender}`);
      });

      doc.end();
      resolve(filePath);
    } catch (err) {
      reject(err);
    }
  });
};
