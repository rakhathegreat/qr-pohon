import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TreeForm from '@features/trees/components/TreeForm';
import type { TreeFormValues } from '@features/trees/types';
import { createTreeFormDefaults } from '@features/trees/utils/form';
import { supabase } from '@shared/services/supabase';

const AddTree = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues = useMemo(() => createTreeFormDefaults(), []);

  const handleSubmit = async (values: TreeFormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('trees')
      .insert([{ ...values, created_at: new Date().toISOString() }]);
    setIsSubmitting(false);

    if (error) {
      alert(error.message);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="px-6 py-6 max-w-4xl mx-auto space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold">Add New Tree</h1>

      <TreeForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        submitLabel="Save Tree"
        cancelLabel="Cancel"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AddTree;
