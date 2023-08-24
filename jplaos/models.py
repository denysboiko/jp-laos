import datetime

from django.contrib.auth.models import AbstractUser, User
from django.db import models
from django.db.models import Sum
from smart_selects.db_fields import ChainedManyToManyField


class Partner(models.Model):
    partner_name = models.CharField(max_length=80)

    def __str__(self):
        return self.partner_name

    class Meta:
        db_table = 'partners'


class PartnerUser(models.Model):
    user = models.OneToOneField(User, related_name='partner_user', on_delete=models.CASCADE)
    primary_partner = models.ForeignKey(Partner, related_name='primary_users', on_delete=models.CASCADE)
    partners_access = models.ManyToManyField(Partner, related_name='users_with_access')

    def __str__(self):
        return self.user.username

    class Meta:
        db_table = 'partner_user'
        verbose_name = 'Partner User'
        verbose_name_plural = 'Partner Users'


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
        return f"{self.short_name}: {self.goal}"

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
    sdg = models.ManyToManyField(SustainableDevelopmentGoal, related_name='priority_areas')
    outcomes = models.ManyToManyField(NSEDPOutcome, related_name='priority_areas')

    def __str__(self):
        return self.priority_area

    class Meta:
        db_table = 'priority_areas'


class Sector(models.Model):
    sector_name = models.CharField(max_length=120)
    priority_area = models.ForeignKey(PriorityArea, related_name='sectors', on_delete=models.CASCADE)

    def __str__(self):
        return self.sector_name

    class Meta:
        db_table = 'sectors'


class Responsible(models.Model):
    responsible_name = models.CharField(max_length=80)

    def __str__(self):
        return self.responsible_name

    class Meta:
        db_table = 'responsible'


class ImplementingPartnerCategory(models.Model):
    category = models.CharField(max_length=120, blank=False)

    def __str__(self):
        return self.category

    class Meta:
        db_table = 'implementing_partner_categories'
        verbose_name = "Implementing Partner Category"
        verbose_name_plural = "Implementing Partner Categories"


class GreenCategory(models.Model):
    category = models.CharField(max_length=250)

    def __str__(self):
        return self.category

    class Meta:
        db_table = 'green_categories'


class GreenSubCategory(models.Model):
    category = models.ForeignKey(GreenCategory, related_name='sub_category', on_delete=models.CASCADE)
    sub_category = models.CharField(max_length=250)

    def __str__(self):
        return self.sub_category


class Modality(models.Model):
    modality = models.CharField(max_length=120)

    def __str__(self):
        return self.modality

    class Meta:
        verbose_name_plural = "Modality"


class PhakhaoLaoCategory(models.Model):
    green_category = models.CharField(max_length=120)

    def __str__(self):
        return self.green_category

    class Meta:
        db_table = 'phakhao_lao_categories'
        verbose_name_plural = "Phakhao Lao"


class ForestPartnershipCategory(models.Model):
    green_category = models.CharField(max_length=120)

    def __str__(self):
        return self.green_category

    class Meta:
        db_table = 'forest_partnership_categories'
        verbose_name_plural = "Forest Partnership"


class ComplementaryAreaCategory(models.Model):
    green_category = models.CharField(max_length=120)

    def __str__(self):
        return self.green_category

    class Meta:
        db_table = 'complementary_area_categories'
        verbose_name_plural = "Complementary Areas"


class GreenCatalyzersCategory(models.Model):
    green_category = models.CharField(max_length=120)

    def __str__(self):
        return self.green_category

    class Meta:
        db_table = 'green_catalyzers_categories'
        verbose_name_plural = "Green Catalyzers"


class ProgrammingCycle(models.Model):
    programming_cycle = models.CharField(max_length=100)

    def __str__(self):
        return self.programming_cycle

    class Meta:
        db_table = 'programming_cycle'
        verbose_name_plural = "Programming Cycles"


class Project(models.Model):
    project_code = models.CharField(max_length=40, blank=True, null=True)
    project_title = models.TextField(max_length=280)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    implementing_partner_categories = models.ManyToManyField(ImplementingPartnerCategory)
    sector = models.ForeignKey(Sector, related_name='sector_id', on_delete=models.CASCADE)
    cross_cutting_issues = models.ManyToManyField(CrossCuttingIssue, blank=True)
    outcomes = models.ManyToManyField(NSEDPOutcome, blank=True, verbose_name='NSEDP Outcome')
    is_regional = models.BooleanField(default=False)
    complementary_area_categories = models.ManyToManyField(ComplementaryAreaCategory, blank=True)
    green_catalyzers_categories = models.ManyToManyField(GreenCatalyzersCategory, blank=True)
    additional_info = models.TextField(blank=True)
    programming_cycle = models.ForeignKey(
        ProgrammingCycle,
        on_delete=models.CASCADE,
        related_name='projects',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.project_title

    @property
    def has_green_category(self):
        return (self.funding_by_phakhao_lao.count() + self.funding_by_forest_partnership.count()
                + self.complementary_area_categories.count() + self.green_catalyzers_categories.count()) > 0

    @property
    def total_funding(self):
        return self.partners.aggregate(Sum('planed_amount'))['planed_amount__sum']

    @property
    def status_code(self):

        if self.start_date > datetime.datetime.today().date():
            return 'Planned'
        elif self.end_date is None:
            return 'Ongoing'
        elif self.end_date < datetime.datetime.today().date():
            return 'Closed'
        else:
            return 'Ongoing'

    @property
    def get_is_cofounded(self):
        return self.partners.count() > 1

    class Meta:
        db_table = 'projects'


class FundingByModality(models.Model):
    project = models.ForeignKey(Project, related_name='funding_by_modality', on_delete=models.CASCADE)
    modality = models.ForeignKey(Modality, related_name='funding', on_delete=models.CASCADE)
    allocation = models.IntegerField()

    class Meta:
        verbose_name = "Funding Modality"
        verbose_name_plural = "Funding Modality"


class FundingByGreenCategory(models.Model):
    project = models.ForeignKey(Project, related_name='funding_by_green_category', on_delete=models.CASCADE)
    category = models.ForeignKey(GreenCategory, related_name='funding', on_delete=models.CASCADE)
    allocation = models.IntegerField(verbose_name="Allocation (%)")

    class Meta:
        verbose_name = "Funding by Green Category"
        verbose_name_plural = "Funding by Green Category"


class PartnerFunding(models.Model):
    partner = models.ForeignKey(Partner, related_name='partners', on_delete=models.CASCADE)
    project = models.ForeignKey(Project, related_name='partners', on_delete=models.CASCADE)
    planed_amount = models.FloatField(verbose_name='Planned Amount (€)')

    class Meta:
        verbose_name = "Funding by Partner"
        verbose_name_plural = "Funding by Partner"


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
    partner = models.ForeignKey(Partner, blank=False, null=False, related_name='pipelines', on_delete=models.CASCADE)

    class Meta:
        db_table = 'pipeline'
        verbose_name = 'Indicative Financial Commitment'
        verbose_name_plural = 'Indicative Financial Commitments'



class PipelinePlannedAmount(models.Model):
    sector = models.ForeignKey(Sector, related_name='pipeline_by_partners', blank=True, null=True,
                               on_delete=models.CASCADE)
    amount = models.FloatField(blank=False, null=False, verbose_name="Planned Amount (€)")
    pipeline = models.ForeignKey(Pipeline, blank=True, null=True, related_name='planned_amount',
                                 on_delete=models.CASCADE)
