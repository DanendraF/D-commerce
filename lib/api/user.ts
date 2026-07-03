import { supabase } from '@/lib/supabase';
import { Address } from '@/lib/types';

export const userApi = {
  async getAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }

    return data.map((d: any) => ({
      id: d.id,
      firstName: d.first_name,
      lastName: d.last_name,
      phone: d.phone,
      addressLine1: d.address_line1,
      addressLine2: d.address_line2,
      city: d.city,
      state: d.state,
      postalCode: d.postal_code,
      country: d.country,
      isDefault: d.is_default,
      label: d.label,
    }));
  },

  async createAddress(userId: string, address: Partial<Address>): Promise<Address | null> {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        first_name: address.firstName,
        last_name: address.lastName,
        phone: address.phone,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country || 'Indonesia',
        label: address.label,
        is_default: address.isDefault || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      country: data.country,
      isDefault: data.is_default,
      label: data.label,
    };
  },

  async updateAddress(addressId: string, address: Partial<Address>): Promise<Address | null> {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        first_name: address.firstName,
        last_name: address.lastName,
        phone: address.phone,
        address_line1: address.addressLine1,
        address_line2: address.addressLine2,
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
        label: address.label,
        is_default: address.isDefault,
      })
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      addressLine1: data.address_line1,
      addressLine2: data.address_line2,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      country: data.country,
      isDefault: data.is_default,
      label: data.label,
    };
  },

  async deleteAddress(addressId: string): Promise<boolean> {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);
    
    if (error) {
      console.error('Error deleting address:', error);
      return false;
    }
    
    return true;
  }
};
