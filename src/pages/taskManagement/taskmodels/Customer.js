export default class Customer {
    constructor({
      id = 0,
      customerName = 'Unnamed Customer',
      phone = 'No Phone',
      location = 'No Location',
      email = null,
      address = null,
      notes = null,
      status = null,
      image = null,
      company = null,
      gstNumber = null,
      siteType = null,
      lat = null,
      lng = null
    } = {}) {
      this.id = id;
      this.customerName = customerName;
      this.phone = phone && phone !== "'0'" ? phone : 'No Phone';
      this.location = location && location !== 'notset' ? location : 'No Location';
      this.email = email;
      this.address = address;
      this.notes = notes;
      this.status = status;
      this.image = image;
      this.company = company;
      this.gstNumber = gstNumber;
      this.siteType = siteType;
      this.lat = lat;
      this.lng = lng;
    }
  
    static fromJson(json) {
      return new Customer({
        id: json.id || 0,
        customerName: json.customerName || 'Unnamed Customer',
        phone: json.phone !== null && json.phone !== "'0'" ? json.phone : 'No Phone',
        location: json.location !== null && json.location !== 'notset' ? json.location : 'No Location',
        email: json.email,
        address: json.address,
        notes: json.notes,
        status: json.status,
        image: json.image,
        company: json.company,
        gstNumber: json.gstNumber,
        siteType: json.siteType,
        lat: json.lat,
        lng: json.lng
      });
    }
  
    toJson() {
      return {
        id: this.id,
        customerName: this.customerName,
        phone: this.phone,
        location: this.location,
        email: this.email,
        address: this.address,
        notes: this.notes,
        status: this.status,
        image: this.image,
        company: this.company,
        gstNumber: this.gstNumber,
        siteType: this.siteType,
        lat: this.lat,
        lng: this.lng
      };
    }
  }