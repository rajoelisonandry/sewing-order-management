import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { OrderFormData } from '@/types/order';
import { STATUS_OPTIONS } from '@/constants/status';
import { FiUpload, FiX } from 'react-icons/fi';

interface OrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: OrderFormData;
  orderId?: string;
}

export default function OrderForm({
  onSuccess,
  onCancel,
  initialData,
  orderId,
}: OrderFormProps) {
  const { user } = useAuth();
  const isEditing = !!orderId;
  const [formData, setFormData] = useState<OrderFormData>(
    initialData || {
      client_name: '',
      model: '',
      fabric_color: '',
      size: '',
      fabric_price: '',
      selling_price: '',
      delivery_date: '',
      delivery_location: '',
      order_count: '',
      model_image: '',
      advance_payment: '',
      status: 0,
    },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    (initialData?.model_image as string) || '',
  );
  const [uploading, setUploading] = useState(false);

  const inputClass =
    'rounded-3xl border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-4 py-3 text-sm text-secondary-900 dark:text-white shadow-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Le fichier doit être une image');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, model_image: '' }));
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile || !imagePreview.startsWith('data:')) {
      // Image already uploaded or no new image - return current imagePreview
      return imagePreview || undefined;
    }

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = `orders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('model-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('model-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError("Erreur lors du téléchargement de l'image");
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      // Upload image and get the final URL
      const imageUrl = await uploadImage();

      const dataToInsert = {
        client_name: formData.client_name,
        model: formData.model,
        fabric_color: formData.fabric_color,
        size: formData.size,
        fabric_price: parseFloat(formData.fabric_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        profit:
          (parseFloat(formData.selling_price) || 0) -
          (parseFloat(formData.fabric_price) || 0),
        delivery_date: formData.delivery_date || null,
        delivery_location: formData.delivery_location || null,
        order_count: formData.order_count
          ? parseInt(formData.order_count)
          : null,
        model_image: imageUrl || undefined,
        advance_payment: formData.advance_payment
          ? parseFloat(formData.advance_payment)
          : null,
        status:
          formData.status !== undefined
            ? parseInt(formData.status.toString())
            : 0,
        ...(isEditing ? {} : { created_by: user.id }),
      };

      if (isEditing) {
        // Update existing order
        const { error } = await supabase
          .from('orders')
          .update(dataToInsert)
          .eq('id', orderId);

        if (error) throw error;
      } else {
        // Insert new order
        const { error } = await supabase
          .from('orders')
          .insert([{ ...dataToInsert, created_by: user.id }]);

        if (error) throw error;
      }

      onSuccess?.();
    } catch (err) {
      console.error('Error saving order:', err);
      setError("Erreur lors de l'enregistrement de la commande");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-3xl border border-tertiary-200 dark:border-tertiary-900 bg-tertiary-50 dark:bg-tertiary-900 px-4 py-3 text-sm text-tertiary-700 dark:text-tertiary-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Nom du Client *
          </label>
          <input
            type="text"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Modèle *
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Couleur du Tissu
          </label>
          <input
            type="text"
            name="fabric_color"
            value={formData.fabric_color}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Taille
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Prix du Tissu (Ar)
          </label>
          <input
            type="number"
            name="fabric_price"
            value={formData.fabric_price}
            onChange={handleChange}
            step="0.01"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Prix de Vente (Ar)
          </label>
          <input
            type="number"
            name="selling_price"
            value={formData.selling_price}
            onChange={handleChange}
            step="0.01"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Date de Livraison
          </label>
          <input
            type="date"
            name="delivery_date"
            value={formData.delivery_date}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Lieu de Livraison
          </label>
          <input
            type="text"
            name="delivery_location"
            value={formData.delivery_location}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Nombre de Commandes
          </label>
          <input
            type="number"
            name="order_count"
            value={formData.order_count}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Acompte (Ar)
          </label>
          <input
            type="number"
            name="advance_payment"
            value={formData.advance_payment}
            onChange={handleChange}
            step="0.01"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={inputClass}
          >
            {Object.entries(STATUS_OPTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
          Image du Modèle
        </h3>

        {imagePreview ? (
          <div className="relative rounded-3xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
            <img
              src={imagePreview}
              alt="Prévisualisation"
              className="w-full h-64 object-cover"
            />
            {imageFile && imagePreview.startsWith('data:') && (
              <div className="absolute top-3 right-3">
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}
          </div>
        ) : null}

        <label className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 px-4 py-6 cursor-pointer transition hover:bg-secondary-100 dark:hover:bg-secondary-700">
          <FiUpload
            size={24}
            className="text-secondary-500 dark:text-secondary-400"
          />
          <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
            {imagePreview ? "Changer l'image" : 'Ajouter une image'}
          </span>
          <span className="text-xs text-secondary-500 dark:text-secondary-400">
            PNG, JPG ou GIF (max 5MB)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-3xl border border-secondary-200 bg-secondary-100 px-5 py-3 text-sm font-semibold text-secondary-700 dark:text-secondary-400 transition hover:bg-secondary-200"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="rounded-3xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Enregistrement...' : isEditing ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
