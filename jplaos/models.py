import datetime

from django.contrib.auth.models import User
from django.db import models
from smart_selects.db_fields import ChainedManyToManyField


class Status(models.Model):
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.status

    class Meta:
        db_table = 'status'
        verbose_name_plural = "statuses"


class Province(models.Model):
    pcode = models.IntegerField()
    name = models.CharField(max_length=120)
    name_l = models.CharField(max_length=120)
    longitude = models.FloatField()
    latitude = models.FloatField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'provinces'
        ordering = ['name']


class District(models.Model):
    dcode = models.IntegerField()
    name = models.CharField(max_length=120)
    name_l = models.CharField(max_length=120)
    area = models.FloatField()
    province = models.ForeignKey(Province, related_name='districts', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'districts'


class SustainableDevelopmentGoal(models.Model):
    short_name = models.CharField(max_length=10)
    goal = models.CharField(max_length=120)

    def __str__(self):
        return self.goal

    class Meta:
        db_table = 'sustainable_development_goals'
        verbose_name = "Sustainable Development Goal"


class CrossCuttingIssue(models.Model):
    issue = models.CharField(max_length=120)

    def __str__(self):
        return self.issue

    class Meta:
        db_table = 'cross_cutting_issues'


class NSEDPOutcome(models.Model):
    outcome = models.CharField(max_length=250)

    def __str__(self):
        return self.outcome

    class Meta:
        db_table = 'nsedp_outcomes'
        verbose_name = "NSEDP Outcome"


class NSEDPOutput(models.Model):
    output = models.CharField(max_length=250)
    outcome = models.ForeignKey(NSEDPOutcome, related_name='outputs', on_delete=models.CASCADE)

    def __str__(self):
        return self.output

    class Meta:
        db_table = 'nsedp_outputs'
        verbose_name = "NSEDP Output"


class PriorityArea(models.Model):

    priority_area = models.CharField(max_length=120)

    def __str__(self):
        return self.priority_area

    class Meta:
        db_table = 'priority_areas'


class Sector(models.Model):
    sector_name = models.CharField(max_length=120)
    priority_area = models.ForeignKey(PriorityArea, related_name='sectors', on_delete=models.CASCADE)
    sdg = models.ManyToManyField(SustainableDevelopmentGoal, related_name='sectors')
    outputs = models.ManyToManyField(NSEDPOutput, related_name='sectors')

    def __str__(self):
        return self.sector_name

    class Meta:
        db_table = 'sectors'


class Subsector(models.Model):
    other_subsector_name = models.CharField(max_length=80)

    def __str__(self):
        return self.other_subsector_name

    class Meta:
        db_table = 'subsectors'


class Responsible(models.Model):
    responsible_name = models.CharField(max_length=80)

    def __str__(self):
        return self.responsible_name

    class Meta:
        db_table = 'responsible'


class Partner(models.Model):
    partner_name = models.CharField(max_length=80)
    users_access = models.ManyToManyField(User, blank=True)

    def __str__(self):
        return self.partner_name

    class Meta:
        db_table = 'partners'


class ImplementingPartner(models.Model):
    implementing_partner_name = models.CharField(max_length=120)

    def __str__(self):
        return self.implementing_partner_name

    class Meta:
        db_table = 'implementing_partners'
        ordering = ['implementing_partner_name']


class GreenCategory(models.Model):
    category = models.CharField(max_length=250)

    def __str__(self):
        return self.category


class GreenSubCategory(models.Model):
    category = models.ForeignKey(GreenCategory, related_name='sub_category', on_delete=models.CASCADE)
    sub_category = models.CharField(max_length=250)

    def __str__(self):
        return self.sub_category


class Project(models.Model):
    project_code = models.CharField(max_length=40, blank=True, null=True)
    project_title = models.TextField(max_length=280)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True, default='9999-12-31')
    planed_amount = models.FloatField()
    partner = models.ForeignKey(Partner, related_name='partner_id', on_delete=models.CASCADE)
    implementing_partner = models.ManyToManyField(ImplementingPartner, blank=True)
    sector = models.ForeignKey(Sector, related_name='sector_id', on_delete=models.CASCADE)
    other_subsector = models.ForeignKey(Subsector, on_delete=models.CASCADE, blank=True, null=True)

    cross_cutting_issues = models.ManyToManyField(CrossCuttingIssue, blank=True)

    def __str__(self):
        return self.project_title

    def status_code(self):

        if self.start_date > datetime.datetime.today().date():
            return 'Planned'
        elif self.end_date is None:
            return 'Ongoing'
        elif self.end_date < datetime.datetime.today().date():
            return 'Closed'
        else:
            return 'Ongoing'

    class Meta:
        db_table = 'projects'


class GreenSubCategoryFundingAllocation(models.Model):
    sub_category = models.ForeignKey(GreenSubCategory, related_name='funding_allocation', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, blank=True, null=True, related_name='green_categories_funding', on_delete=models.CASCADE)
    funding_allocation = models.PositiveIntegerField()


class Location(models.Model):
    project = models.ForeignKey(Project, blank=True, null=True, related_name='locations', on_delete=models.CASCADE)
    province = models.ForeignKey(Province, on_delete=models.CASCADE)
    districts = ChainedManyToManyField(
        District,
        verbose_name='districts',
        chained_field="province",
        chained_model_field="province",
        related_name='districs',
        blank=True
    )

    class Meta:
        db_table = 'location'




class Pipeline(models.Model):
    partner = models.ForeignKey(Partner, blank=True, null=True, related_name='pipelines', on_delete=models.CASCADE)
    sector = models.ForeignKey(Sector, blank=True, null=True, related_name='pipelines', on_delete=models.CASCADE)
    class Meta:
        db_table = 'pipeline'

class PipelinePlannedAmount(models.Model):
    sector = models.ForeignKey(Sector, blank=True, null=True, on_delete=models.CASCADE)
    planed_amount_2021 = models.FloatField()
    planed_amount_2022 = models.FloatField()
    planed_amount_2023 = models.FloatField()
    planed_amount_2024 = models.FloatField()
    planed_amount_2025 = models.FloatField()
    planed_amount_2026 = models.FloatField()
    planed_amount_2027 = models.FloatField()
    pipeline = models.ForeignKey(Pipeline, blank=True, null=True, related_name='planned_amount',
                                on_delete=models.CASCADE)