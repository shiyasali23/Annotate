# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.utils import timezone

# @receiver(post_save, sender=Biometrics)
# def update_biometrics_entry_health_score(sender, instance, **kwargs):
#     biometrics_entry = instance.biometricsentry
#     biochemicals = biometrics_entry.biometrics_entries.values_list('biochemical', flat=True).distinct()
#     total_score = 0

#     for biochemical_id in biochemicals:
#         biometrics = biometrics_entry.biometrics_entries.filter(
#             biochemical_id=biochemical_id,
#             expired_date__gt=timezone.now()
#         ).order_by('-created_at')

#         if biometrics.exists():
#             latest_biometric = biometrics.first()
#             total_score += latest_biometric.scaled_value

#     biometrics_entry.health_score = total_score
#     biometrics_entry.save()
