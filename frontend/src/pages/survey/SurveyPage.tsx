import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, MessageSquareHeart, SendHorizonal } from 'lucide-react';
import { Button } from 'components/atoms/Button';
import { Input } from 'components/atoms/Input';
import { SurveyShowcase } from 'components/organisms/SurveyShowcase';
import { useCreateSurveyReview, useSurveyReviews } from 'hooks/useSurvey';
import { surveySchema, type SurveyFormData } from 'schemas/survey/survey.schema';

const REVIEW_PAGE_SIZE = 5;

const SurveyPage: React.FC = () => {
  const [submitSuccess, setSubmitSuccess] = useState('');
  const {
    data: reviewsPages,
    isLoading: isLoadingReviews,
    error: reviewsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useSurveyReviews(REVIEW_PAGE_SIZE);
  const {
    mutateAsync: createSurveyReview,
    isPending: isSubmittingReview,
    error: submitError,
  } = useCreateSurveyReview();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      name: '',
      review: '',
    },
  });

  const reviewValue = watch('review') ?? '';

  const visibleReviews = useMemo(
    () => reviewsPages?.pages.flatMap((page) => page.reviews) ?? [],
    [reviewsPages]
  );

  const onSubmit = async (data: SurveyFormData) => {
    setSubmitSuccess('');
    await createSurveyReview(data);
    setSubmitSuccess('Terima kasih, review kamu sudah tersimpan.');
    reset();
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_45%,#fff7ed_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-amber-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Cravana Survey</p>
            <p className="text-sm text-slate-500">Review singkat dari pelanggan untuk bantu peningkatan experience.</p>
          </div>
          <Button asChild variant="secondary" className="rounded-full border border-slate-200 bg-white px-4 py-2">
            <Link to="/">
              <span className="inline-flex items-center gap-2">
                <ChevronLeft size={16} />
                Kembali ke landing
              </span>
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 pt-2 sm:px-6 lg:grid-cols-[1fr_0.92fr] lg:px-8">
        <div className="space-y-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              <MessageSquareHeart size={14} />
              Simple feedback form
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Ceritakan kesan kamu setelah menikmati Cravana
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Kami mengundang Anda untuk mengisi survei ini berdasarkan pengalaman pribadi Anda bersama Cravana.
              Mohon isi dengan jujur dan sesuai pengalaman Anda, karena setiap review sangat berarti untuk membantu
              kami menjaga kualitas produk dan meningkatkan layanan.
            </p>
          </div>

          <SurveyShowcase />
        </div>

        <div className="lg:pt-10">
          <div className="rounded-[32px] border border-amber-100 bg-white p-6 shadow-[0_20px_60px_rgba(148,64,14,0.12)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-amber-700">Form Survey</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Bagikan pengalamanmu</h2>
              </div>
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">Progress</p>
                <p className="text-lg font-bold text-amber-900">2 field</p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <Input
                id="survey-name"
                type="text"
                label="Nama"
                placeholder="Contoh: Zaki Dev"
                error={errors.name?.message}
                className="rounded-2xl border-slate-200 px-4 py-3"
                {...register('name')}
              />

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="survey-review" className="block text-sm font-medium text-slate-700">
                    Review
                  </label>
                  <span className="text-xs text-slate-400">{reviewValue.length}/280</span>
                </div>
                <textarea
                  id="survey-review"
                  rows={6}
                  placeholder="Ceritakan kesan kamu tentang rasa, packaging, atau pengalaman order Cravana..."
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-400',
                    errors.review ? 'border-red-500' : 'border-slate-200',
                  ].join(' ')}
                  {...register('review')}
                />
                {errors.review ? <p className="mt-1 text-xs text-red-500">{errors.review.message}</p> : null}
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl bg-amber-600 px-4 py-3 text-base font-semibold hover:bg-amber-700"
                disabled={isSubmitting || isSubmittingReview}
              >
                <span className="inline-flex items-center gap-2">
                  <SendHorizonal size={18} />
                  {isSubmitting || isSubmittingReview ? 'Mengirim review...' : 'Kirim review'}
                </span>
              </Button>
            </form>

            {submitError ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError instanceof Error ? submitError.message : 'Gagal mengirim review'}
              </div>
            ) : null}

            {submitSuccess ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 flex-shrink-0" size={18} />
                <p>{submitSuccess}</p>
              </div>
            ) : null}

            <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold">Review terbaru</p>
              {isLoadingReviews ? (
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/80">Memuat review terbaru...</div>
              ) : reviewsError ? (
                <div className="mt-4 rounded-2xl bg-red-500/20 p-4 text-sm text-red-200">
                  {reviewsError instanceof Error ? reviewsError.message : 'Gagal memuat review terbaru'}
                </div>
              ) : (
                <>
                  <div className="mt-4 max-h-[380px] space-y-3 overflow-y-auto pr-1">
                    {visibleReviews.length === 0 ? (
                      <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/80">Belum ada review yang tampil.</div>
                    ) : (
                      visibleReviews.map((item) => (
                        <article key={item.id} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                          <div className="flex items-center justify-between gap-4">
                            <p className="font-semibold">{item.name}</p>
                            <span className="text-xs text-white/60">
                              {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/80">“{item.review}”</p>
                        </article>
                      ))
                    )}
                  </div>

                  {hasNextPage ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-4 w-full rounded-xl bg-white/90 text-slate-900 hover:bg-white"
                      onClick={() => {
                        void fetchNextPage();
                      }}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Memuat review berikutnya...' : 'Tampilkan 5 review berikutnya'}
                    </Button>
                  ) : null}
                </>
              )}

            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SurveyPage;
