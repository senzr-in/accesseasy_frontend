export default class Employee {
    constructor({
      id = 0,
      firstName = 'Unknown',
      departmentId = null,
      branchId = null
    } = {}) {
      this.id = id;
      this.firstName = firstName;
      this.departmentId = departmentId;
      this.branchId = branchId;
    }
  
    static fromJson(json) {
      let departmentId = null;
      try {
        if (json.assignedDepartment && json.assignedDepartment.department_id) {
          departmentId = json.assignedDepartment.department_id.id;
        }
      } catch (e) {
        console.error('Error parsing department ID:', e);
      }
  
      let branchId = null;
      try {
        if (json.assignedBranch && json.assignedBranch.branch_id) {
          branchId = json.assignedBranch.branch_id.id;
        }
      } catch (e) {
        console.error('Error parsing branch ID:', e);
      }
  
      let firstName = 'Unknown';
      try {
        if (json.assignedUser && json.assignedUser.first_name) {
          firstName = json.assignedUser.first_name;
        }
      } catch (e) {
        console.error('Error parsing first name:', e);
      }
  
      return new Employee({
        id: json.id || 0,
        firstName,
        departmentId,
        branchId
      });
    }
  
    toString() {
      return `${this.firstName} (ID: ${this.id})`;
    }
  }
  
  export class Branch {
    constructor({
      id = 0,
      name = 'Unknown Branch'
    } = {}) {
      this.id = id;
      this.name = name;
    }
  
    static fromJson(json) {
      return new Branch({
        id: json.id || 0,
        name: json.branchName || 'Unknown Branch'
      });
    }
  
    toString() {
      return this.name;
    }
  }
  
  export class Department {
    constructor({
      id = 0,
      name = 'Unknown Department'
    } = {}) {
      this.id = id;
      this.name = name;
    }
  
    static fromJson(json) {
      return new Department({
        id: json.id || 0,
        name: json.departmentName || 'Unknown Department'
      });
    }
  
    toString() {
      return this.name;
    }
  }