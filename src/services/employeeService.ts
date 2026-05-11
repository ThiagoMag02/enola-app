import { supabase } from '@/lib/supabase';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type EmploymentStatus = 'WORKING' | 'ON_LEAVE' | 'SUSPENDED' | 'VACATION';

export interface Employee {
  id: string;
  employee_code?: string;
  cost_center_id?: string;
  first_name: string;
  last_name: string;
  cuil: string; // Required for business logic
  street?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  cbu?: string;
  bank?: string;
  agreement?: string;
  category?: string;
  license_card?: string;
  license_card_expiration?: string;
  hire_date?: string;
  seniority?: string;
  termination_date?: string | null;
  termination_reason?: string | null;
  status: EmployeeStatus;
  employment_status: EmploymentStatus;
  created_at: string;
  updated_at?: string;
  cost_center?: any;
}

/**
 * Normalizes CUIL by removing any non-numeric characters.
 */
const normalizeCuil = (cuil: string): string => {
  return cuil.replace(/\D/g, '');
};

export const employeeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*, cost_center:cost_centers(*, company:companies(*))')
      .order('last_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getActive() {
    const { data, error } = await supabase
      .from('employees')
      .select('*, cost_center:cost_centers(*, company:companies(*))')
      .eq('status', 'ACTIVE')
      .order('last_name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*, cost_center:cost_centers(*, company:companies(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async findByCuil(cuil: string) {
    const normalized = normalizeCuil(cuil);
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, cuil, status, employment_status')
      .eq('cuil', normalized)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createOrReactivateEmployee(employeeData: Partial<Employee>) {
    if (!employeeData.cuil) throw new Error("CUIL es obligatorio");
    
    const normalizedCuil = normalizeCuil(employeeData.cuil);
    const existing = await this.findByCuil(normalizedCuil);

    if (existing) {
      if (existing.status === 'ACTIVE') {
        throw new Error("El CUIL ya pertenece a un empleado activo");
      }

      // Reactivate INACTIVE employee
      const { data, error } = await supabase
        .from('employees')
        .update({
          ...employeeData,
          cuil: normalizedCuil,
          status: 'ACTIVE',
          employment_status: 'WORKING',
          termination_date: null,
          termination_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }

    // Create new employee - Generate code if not present
    let nextCode = employeeData.employee_code;
    if (!nextCode) {
      const { data: lastEmp } = await supabase
        .from('employees')
        .select('employee_code')
        .order('employee_code', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const lastNum = lastEmp?.employee_code ? parseInt(lastEmp.employee_code.split('-')[1]) : 0;
      nextCode = `EMP-${(lastNum + 1).toString().padStart(3, '0')}`;
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([{
        ...employeeData,
        employee_code: nextCode,
        cuil: normalizedCuil,
        status: 'ACTIVE',
        employment_status: 'WORKING',
        termination_date: null,
        termination_reason: null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, employee: Partial<Employee>) {
    const updateData = { ...employee, updated_at: new Date().toISOString() };
    if (employee.cuil) {
      updateData.cuil = normalizeCuil(employee.cuil);
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deactivateEmployee(id: string, reason: string) {
    if (!reason) throw new Error("El motivo de baja es obligatorio");

    const { data, error } = await supabase
      .from('employees')
      .update({ 
        status: 'INACTIVE', 
        termination_reason: reason, 
        termination_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
