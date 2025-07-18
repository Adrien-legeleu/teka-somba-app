type DynamicField = {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[];
};

type AdPreviewProps = {
  ad: {
    title?: string;
    description?: string;
    price?: number;
    location?: string;
    images?: string[];
    lat?: number | null;
    categoryId?: string | null;
    lng?: number | null;
    dynamicFields?: Record<string, any>;
  };
  dynamicFields?: DynamicField[];
};

export default function AdPreview({ ad, dynamicFields }: AdPreviewProps) {
  if (!ad.title)
    return <div className="p-4 bg-gray-50 rounded">Aperçu de l’annonce…</div>;

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-bold">{ad.title}</h3>
      <div className="flex gap-2 mb-2">
        {ad.images &&
          ad.images.length > 0 &&
          ad.images.map((img, i) => (
            <img
              src={img}
              key={i}
              alt=""
              className="w-14 h-14 object-cover rounded"
            />
          ))}
      </div>
      <div className="mb-1 text-sm">{ad.description}</div>
      <div className="font-bold">{ad.price} FCFA</div>
      <div className="text-xs text-gray-500">{ad.location}</div>
      {/* Affiche les champs dynamiques */}
      <ul className="mt-2">
        {dynamicFields?.map(
          (f) =>
            ad.dynamicFields &&
            ad.dynamicFields[f.name] !== undefined && (
              <li key={f.name}>
                <b>{f.name}</b> : {String(ad.dynamicFields[f.name])}
              </li>
            )
        )}
      </ul>
    </div>
  );
}
