FROM python:3.8-slim

MAINTAINER Ben Weisburd

COPY --from=quay.io/biocontainers/tabix:0.2.6--ha92aebf_0 /usr/local/bin/tabix /usr/local/bin/tabix
COPY --from=quay.io/biocontainers/tabix:0.2.6--ha92aebf_0 /usr/local/bin/bgzip /usr/local/bin/bgzip
COPY convert_SJ_out_tab_to_junctions_bed.py /


RUN python3 -m pip install pandas psutil

COPY convert_SJ_out_tab_to_junctions_bed.py /
COPY gencode_utils.py /

ENTRYPOINT /bin/bash
