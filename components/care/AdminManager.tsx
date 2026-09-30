"use client";
import { useState, type FormEvent } from "react";
import { Species } from "@prisma/client";
import { useLocale } from "next-intl";
import { api } from "@/trpc/react";
import { speciesLabels } from "@/lib/care/labels";
import {
  CareShell,
  Field,
  Feedback,
  buttonClass,
  fieldClass,
  panelClass,
  secondaryClass,
} from "./CareShell";
export function AdminManager() {
  const vi = useLocale() === "vi";
  const [selected, setSelected] = useState("");
  const requests = api.management.requests.useQuery();
  const review = api.management.reviewClinic.useMutation({
    onSuccess: async () => {
      setSelected("");
      await requests.refetch();
    },
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    review.mutate({
      userId: selected,
      approve: true,
      clinic: {
        name: String(f.get("name")),
        address: String(f.get("address")),
        city: String(f.get("city")),
        phone: String(f.get("phone")),
        specializations: f.getAll("species") as Species[],
      },
    });
  }
  return (
    <CareShell
      title={vi ? "Duyệt đăng ký phòng khám" : "Clinic registration approvals"}
      description={
        vi
          ? "Kiểm tra thông tin của đơn vị trước khi cấp quyền và công khai phòng khám."
          : "Verify the clinic's details before granting access and publishing its listing."
      }
    >
      <Feedback
        error={requests.error?.message ?? review.error?.message}
        success={
          review.isSuccess
            ? vi
              ? "Đã xử lý yêu cầu."
              : "Request processed."
            : undefined
        }
      />
      {requests.isLoading && (
        <p role="status">{vi ? "Đang tải…" : "Loading…"}</p>
      )}
      {requests.data?.length === 0 && (
        <p>{vi ? "Không có yêu cầu đang chờ." : "No pending requests."}</p>
      )}
      <div className="space-y-4">
        {requests.data?.map((u) => (
          <section key={u.id} className={panelClass}>
            <h2 className="font-semibold">{u.name}</h2>
            <p className="mt-2 text-sm">
              {u.email} · {u.phone}
            </p>
            <div className="mt-4 flex gap-2">
              <button className={buttonClass} onClick={() => setSelected(u.id)}>
                {vi ? "Xem xét cấp quyền" : "Review approval"}
              </button>
              <button
                className={secondaryClass}
                disabled={review.isPending}
                onClick={() => review.mutate({ userId: u.id, approve: false })}
              >
                {vi ? "Từ chối" : "Reject"}
              </button>
            </div>
            {selected === u.id && (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={vi ? "Tên phòng khám" : "Clinic name"}>
                    <input
                      name="name"
                      required
                      minLength={2}
                      maxLength={200}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={vi ? "Số điện thoại" : "Phone"}>
                    <input
                      name="phone"
                      required
                      minLength={8}
                      maxLength={30}
                      defaultValue={u.phone ?? ""}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={vi ? "Địa chỉ" : "Address"}>
                    <input
                      name="address"
                      required
                      minLength={5}
                      maxLength={500}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={vi ? "Tỉnh / thành" : "City"}>
                    <input
                      name="city"
                      required
                      minLength={2}
                      maxLength={100}
                      className={fieldClass}
                    />
                  </Field>
                </div>
                <fieldset>
                  <legend>{vi ? "Loài tiếp nhận" : "Supported species"}</legend>
                  <div className="mt-3 flex flex-wrap gap-4">
                    {Object.entries(speciesLabels).map(([key, labels]) => (
                      <label key={key} className="flex gap-2 text-sm">
                        <input name="species" type="checkbox" value={key} />
                        {labels[vi ? 0 : 1]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" required />
                  {vi
                    ? "Đã kiểm tra thông tin và điều kiện hoạt động của phòng khám"
                    : "Clinic details and operating credentials have been reviewed"}
                </label>
                <button className={buttonClass} disabled={review.isPending}>
                  {vi ? "Duyệt và tạo phòng khám" : "Approve and create clinic"}
                </button>
              </form>
            )}
          </section>
        ))}
      </div>
    </CareShell>
  );
}
