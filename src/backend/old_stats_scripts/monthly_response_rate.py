#!/usr/bin/env python3

import argparse
import math
from collections import defaultdict

from src.backend.common.nttxtraction import *
from src.backend.common.dbmanager import DBManager
import numpy as np


logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Script to calculate the monthly response rate for the old AFP")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    args = parser.parse_args()

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    num_years_per_month = [10, 10, 10, 11, 11, 10, 10, 11, 10, 11, 10, 11]
    monthly_submissions = defaultdict(lambda: defaultdict(int))
    for year in range(2008, 2020, 1):
        for month in range(1, 13, 1):
            monthly_submissions[month][year] = db_manager.get_num_submissions_year_month_old_afp(year, month)
    month_totals = [sum(months_counts.values()) for months_counts in monthly_submissions.values()]
    means = [tot / n_years for tot, n_years in zip(month_totals, num_years_per_month)]
    sumsq = [sum([(month_count - means[month])**2 for month_count in months_counts.values() if month_count > 0]) for
             month, months_counts in enumerate(monthly_submissions.values())]
    deviations = [math.sqrt(ss / (n - 1)) for ss, n in zip(sumsq, num_years_per_month)]
    print(means)
    print(deviations)
    print([min([m_count for m_count in months_counts.values() if m_count > 0]) for months_counts in monthly_submissions.values()])
    print([max(months_counts.values()) for months_counts in monthly_submissions.values()])


if __name__ == '__main__':
    main()
