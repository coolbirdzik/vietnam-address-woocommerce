import React, { useEffect, useRef, useState } from 'react';
import { useDistricts, useWards } from '@/hooks/useAddressData';
import type { District, Ward } from '@/types/address.types';

interface AddressSelectorProps {
  type: 'billing' | 'shipping' | 'calc_shipping';
  showWard?: boolean;
}

const getEl = (id: string) => document.getElementById(id) as HTMLSelectElement | null;

const trySelect2 = (selector: string, method: 'init' | 'refresh' | 'destroy') => {
  if (typeof jQuery === 'undefined' || !(jQuery as any).fn?.select2) return;
  try {
    const $el = (jQuery as any)(selector);
    if (method === 'init') $el.select2();
    else if (method === 'refresh') $el.trigger('change.select2');
    else if (method === 'destroy') $el.select2('destroy');
  } catch { /* ignore */ }
};

const buildOptions = (
  el: HTMLSelectElement,
  items: { value: string; label: string }[],
  placeholder: string,
  currentValue?: string
) => {
  el.innerHTML = '';
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = placeholder;
  el.appendChild(empty);
  items.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    el.appendChild(opt);
  });
  if (currentValue) el.value = currentValue;
};

/**
 * Headless component — no rendered UI.
 * Attaches to existing WooCommerce-rendered form selects and drives province → district → ward cascading.
 */
export const AddressSelector: React.FC<AddressSelectorProps> = ({ type, showWard = false }) => {
  const prefix = type === 'calc_shipping' ? 'calc_shipping' : type;
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');

  const provinceRef = useRef('');
  const districtRef = useRef('');

  const { data: districts = [], isLoading: loadingDistricts } = useDistricts(province || null);
  const { data: wards = [], isLoading: loadingWards } = useWards(showWard && district ? district : null);

  // Keep refs in sync so event handlers always have fresh values
  useEffect(() => { provinceRef.current = province; }, [province]);
  useEffect(() => { districtRef.current = district; }, [district]);

  // Refs to latest data — needed inside event handlers that don't re-run on render
  const districtsRef = useRef<District[]>([]);
  const wardsRef = useRef<Ward[]>([]);
  useEffect(() => { districtsRef.current = districts; }, [districts]);
  useEffect(() => { wardsRef.current = wards; }, [wards]);

  // ─── Ward field visibility ────────────────────────────────────────────────
  useEffect(() => {
    if (!showWard || prefix === 'calc_shipping') return;

    const show = () => {
      const wrapper = document.getElementById(`${prefix}_address_2_field`);
      if (wrapper) wrapper.style.display = 'block';
    };
    show();

    if (typeof jQuery !== 'undefined') {
      (jQuery as any)(document.body).on(`updated_checkout.ward_vis_${prefix}`, show);
    }
    return () => {
      if (typeof jQuery !== 'undefined') {
        (jQuery as any)(document.body).off(`updated_checkout.ward_vis_${prefix}`);
      }
    };
  }, [prefix, showWard]);

  // ─── Province listener ────────────────────────────────────────────────────
  useEffect(() => {
    const stateEl = getEl(`${prefix}_state`);
    if (!stateEl) return;

    trySelect2(`#${prefix}_state`, 'init');

    const onChange = () => {
      const val = stateEl.value;
      setProvince(val);
      setDistrict('');
      // Immediately clear district / ward selects
      const cityEl = getEl(`${prefix}_city`);
      if (cityEl) { buildOptions(cityEl, [], 'Select district'); trySelect2(`#${prefix}_city`, 'refresh'); }
      if (showWard) {
        const wardEl = getEl(`${prefix}_address_2`);
        if (wardEl) { buildOptions(wardEl, [], 'Select ward/commune/town'); trySelect2(`#${prefix}_address_2`, 'refresh'); }
      }
      // Trigger WooCommerce shipping recalc on province change
      if (typeof jQuery !== 'undefined') (jQuery as any)('body').trigger('update_checkout');
    };

    stateEl.addEventListener('change', onChange);
    if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
      (jQuery as any)(`#${prefix}_state`).on(`select2:select.cb_${prefix}`, onChange);
    }
    return () => {
      stateEl.removeEventListener('change', onChange);
      if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
        (jQuery as any)(`#${prefix}_state`).off(`select2:select.cb_${prefix}`);
      }
    };
  }, [prefix, showWard]);

  // ─── District listener ────────────────────────────────────────────────────
  useEffect(() => {
    const cityEl = getEl(`${prefix}_city`);
    if (!cityEl) return;

    trySelect2(`#${prefix}_city`, 'init');

    const onChange = () => {
      const val = cityEl.value;
      setDistrict(val);
      // Immediately clear ward select
      if (showWard) {
        const wardEl = getEl(`${prefix}_address_2`);
        if (wardEl) { buildOptions(wardEl, [], 'Select ward/commune/town'); trySelect2(`#${prefix}_address_2`, 'refresh'); }
      }
      // Trigger shipping recalc when district is chosen
      if (val && typeof jQuery !== 'undefined') (jQuery as any)('body').trigger('update_checkout');
    };

    cityEl.addEventListener('change', onChange);
    if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
      (jQuery as any)(`#${prefix}_city`).on(`select2:select.cb_${prefix}`, onChange);
    }
    return () => {
      cityEl.removeEventListener('change', onChange);
      if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
        (jQuery as any)(`#${prefix}_city`).off(`select2:select.cb_${prefix}`);
      }
    };
  }, [prefix, showWard]);

  // ─── Ward listener ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showWard || prefix === 'calc_shipping') return;

    const wardEl = getEl(`${prefix}_address_2`);
    if (!wardEl) return;

    trySelect2(`#${prefix}_address_2`, 'init');

    const onChange = () => {
      // Trigger shipping recalc when ward is chosen
      if (wardEl.value && typeof jQuery !== 'undefined') {
        (jQuery as any)('body').trigger('update_checkout');
      }
    };

    wardEl.addEventListener('change', onChange);
    if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
      (jQuery as any)(`#${prefix}_address_2`).on(`select2:select.cb_${prefix}`, onChange);
    }
    return () => {
      wardEl.removeEventListener('change', onChange);
      if (typeof jQuery !== 'undefined' && (jQuery as any).fn?.select2) {
        (jQuery as any)(`#${prefix}_address_2`).off(`select2:select.cb_${prefix}`);
      }
    };
  }, [prefix, showWard]);

  // ─── Populate districts when data arrives ─────────────────────────────────
  useEffect(() => {
    const cityEl = getEl(`${prefix}_city`);
    if (!cityEl || !province) return;

    if (loadingDistricts) {
      buildOptions(cityEl, [], 'Loading...');
      trySelect2(`#${prefix}_city`, 'refresh');
      return;
    }

    buildOptions(
      cityEl,
      districts.map((d: District) => ({ value: d.maqh, label: d.name })),
      'Select district'
    );
    trySelect2(`#${prefix}_city`, 'refresh');
    // NOTE: Do NOT call triggerWooCommerceUpdate here — it would wipe the select we just built
  }, [districts, loadingDistricts, prefix, province]);

  // ─── Populate wards when data arrives ─────────────────────────────────────
  useEffect(() => {
    if (!showWard || prefix === 'calc_shipping') return;
    const wardEl = getEl(`${prefix}_address_2`);
    if (!wardEl || !district) return;

    if (loadingWards) {
      buildOptions(wardEl, [], 'Loading...');
      trySelect2(`#${prefix}_address_2`, 'refresh');
      return;
    }

    buildOptions(
      wardEl,
      wards.map((w: Ward) => ({ value: w.xaid, label: w.name })),
      'Select ward/commune/town'
    );
    trySelect2(`#${prefix}_address_2`, 'refresh');
    // NOTE: Do NOT call triggerWooCommerceUpdate here
  }, [wards, loadingWards, prefix, district, showWard]);

  // ─── After WooCommerce's checkout AJAX rerenders, restore our selects ──────
  useEffect(() => {
    if (typeof jQuery === 'undefined') return;

    const onUpdated = () => {
      // Re-init Select2 on all our selects
      trySelect2(`#${prefix}_state`, 'init');
      trySelect2(`#${prefix}_city`, 'init');
      if (showWard) trySelect2(`#${prefix}_address_2`, 'init');

      // Restore province value if WooCommerce wiped it
      const stateEl = getEl(`${prefix}_state`);
      if (stateEl && provinceRef.current && stateEl.value !== provinceRef.current) {
        stateEl.value = provinceRef.current;
        trySelect2(`#${prefix}_state`, 'refresh');
      }

      // Re-populate district options (WooCommerce may have reset the select to empty)
      const cityEl = getEl(`${prefix}_city`);
      if (cityEl && provinceRef.current && districtsRef.current.length > 0) {
        buildOptions(
          cityEl,
          districtsRef.current.map((d) => ({ value: d.maqh, label: d.name })),
          'Select district',
          districtRef.current || undefined
        );
        trySelect2(`#${prefix}_city`, 'refresh');
      }

      // Re-populate ward options
      if (showWard) {
        const wardEl = getEl(`${prefix}_address_2`);
        if (wardEl && districtRef.current && wardsRef.current.length > 0) {
          buildOptions(
            wardEl,
            wardsRef.current.map((w) => ({ value: w.xaid, label: w.name })),
            'Select ward/commune/town'
          );
          trySelect2(`#${prefix}_address_2`, 'refresh');
        }
        const wrapper = document.getElementById(`${prefix}_address_2_field`);
        if (wrapper) wrapper.style.display = 'block';
      }
    };

    (jQuery as any)(document.body).on(`updated_checkout.selects_${prefix}`, onUpdated);
    return () => {
      (jQuery as any)(document.body).off(`updated_checkout.selects_${prefix}`);
    };
  }, [prefix, showWard]);

  return null;
};
