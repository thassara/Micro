function DriverCard({ driver }) {
    return (
      <div className="border p-4 rounded-md">
        <p><strong>Name:</strong> {driver.name}</p>
        <p><strong>Available:</strong> {driver.available ? 'Yes' : 'No'}</p>
        <p><strong>Contact:</strong> {driver.contactNumber}</p>
        <p><strong>Vehicle ID:</strong> {driver.vehicleId}</p>
      </div>
    );
  }
  
  export default DriverCard;