const reservationService = require('../routes/reservations');

// Crear una reserva
exports.createReservation = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener una reserva por ID
exports.getReservation = async (req, res) => {
  try {
    const reservation = await reservationService.getReservation(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar una reserva por ID
exports.updateReservation = async (req, res) => {
  try {
    const updatedReservation = await reservationService.updateReservation(
      req.params.id,
      req.body
    );
    if (!updatedReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(updatedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una reserva por ID
exports.deleteReservation = async (req, res) => {
  try {
    const deletedReservation = await reservationService.deleteReservation(
      req.params.id
    );
    if (!deletedReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
