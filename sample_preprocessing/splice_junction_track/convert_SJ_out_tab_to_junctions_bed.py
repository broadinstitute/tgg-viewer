#!/usr/bin/env python3

import argparse
import gzip
import os
import re
from gencode_utils import parse_introns_from_gencode_gff

p = argparse.ArgumentParser(description="This script takes a STAR splice junction file (*.SJ.out.tab) and converts "
    "it to a .junctions.bed.gz file (with .tbi index) which can be loaded into IGV.js."
    "It assumes bgzip and tabix are installed and on PATH.")
p.add_argument('-g', '--gencode-gff', help="Path of gencode .gff3 file for annotating known junctions. "
    "This is needed because STAR in 2-pass mode marks junctions as 'known' when they were found on the 1st pass, "
    "which represents almost all junctions.")
p.add_argument('-L', '--interval', action="append", default=[], help="Only keep junctions contained in the given "
     "chr:start-end interval(s)")
p.add_argument('input_path', nargs="+", help="Input *.SJ.out.tab(.gz?) or .tsv(.gz?) file path. "
     "A header line with column labels is optional. If more than 1 input path is specified, they will be converted  "
     "one after the other, in a loop.")
args = p.parse_args()

print(f"Input: {args.input_path}")

"""
Output .bed format:

column 1: chromosome
column 2: first base of the intron (0-based)
column 3: first base of the intron (1-based)
column 4: name  (overloaded to store the total number of unique + multi-mapped reads spanning the junction)
column 5: score number of uniquely-maapped reads spanning the junction
column 6: strand ("+" or "-")
"""

# from http://labshare.cshl.edu/shares/gingeraslab/www-data/dobin/STAR/STAR.posix/doc/STARmanual.pdf
"""
Input .SJ.out.tab format:

column 1: chromosome
column 2: first base of the intron (1-based)
column 3: last base of the intron (1-based)
column 4: strand (0: undefined, 1: +, 2: -)
column 5: intron motif: 0: non-canonical; 1: GT/AG, 2: CT/AC, 3: GC/AG, 4: CT/GC, 5:AT/AC, 6: GT/AT
column 6: 0: unannotated, 1: annotated (only if splice junctions database is used)
column 7: number of uniquely mapping reads crossing the junction
column 8: number of multi-mapping reads crossing the junction
column 9: maximum spliced alignment overhang
"""

# https://genome.ucsc.edu/FAQ/FAQformat.html
"""
.bed format examples:

chr7    127474697  127475864  Pos4  0  +
chr7    127475864  127477031  Neg1  0  -
"""

STRAND_LOOKUP = {
    '0': '.',
    '1': '+',
    '2': '-',
}

MOTIF_LOOKUP =  {
    '0': 'non-canonical',
    '1': 'GT/AG',
    '2': 'CT/AC',
    '3': 'GC/AG',
    '4': 'CT/GC',
    '5': 'AT/AC',
    '6': 'GT/AT',
}


def parse_interval(i):
    try:
        chrom, start_end = i.split(":")
        start, end = map(int, start_end.replace(",", "").split("-"))
        return chrom, start, end
    except Exception as e:
        raise ValueError(f"Couldn't parse interval: {i}. {e}")


intervals = [parse_interval(i) for i in args.interval]
gencode_introns_set = parse_introns_from_gencode_gff(args.gencode_gff)

for input_path in args.input_path:

    suffix = ".junctions.bed"
    if args.interval:
        if len(args.interval) <= 3:
            suffix = "." + "__".join([i.replace(",", "").replace(":", "-") for i in args.interval]) + suffix
        else:
            suffix = ".filtered" + suffix
    else:
        args.interval = []

    output_path = re.sub("(.SJ.out)?(.tsv|.tab)(.gz)?$", "", input_path) + suffix

    counter = 0
    annotated_counter = 0
    with (gzip.open if input_path.endswith("gz") else open)(input_path, "rt") as f, open(output_path, "wt") as bed_file:
        header = None
        for i, line in enumerate(f):
            if i == 0 and "chrom" in line.lower():
                header = line.strip("\n").split("\t")
                continue # skip header

            fields = line.strip("\n").split("\t")
            chrom = fields[0]
            start_1based = int(fields[1])
            end_1based = int(fields[2])

            if intervals:
                for interval_chrom, interval_start, interval_end in intervals:
                    if interval_chrom == chrom and start_1based >= interval_start and end_1based <= interval_end:
                        break
                else:
                    continue

            strand = STRAND_LOOKUP[fields[3]]
            intron_motif = MOTIF_LOOKUP[fields[4]]
            #is_annotated = str(bool(int(fields[5]))).lower()
            num_uniquely_mapped_reads = int(round(float(fields[6])))
            num_multi_mapped_reads = int(round(float(fields[7])))
            maximum_spliced_alignment_overhang = int(fields[8])

            if header:
                assert header.index("unique_reads") == 6
                assert header.index("multi_mapped_reads") == 7
                assert header.index("maximum_overhang") == 8

            key = (chrom, start_1based, end_1based)
            if key in gencode_introns_set:
                is_annotated = "true"
                annotated_counter += 1
            else:
                is_annotated = "false"

            if num_uniquely_mapped_reads + num_multi_mapped_reads == 0:
                # skip junctions with no read support. Rounding down to 0 may result in this.
                continue

            output_fields = [
                f"motif={intron_motif}",
                f"uniquely_mapped={num_uniquely_mapped_reads}",
                f"multi_mapped={num_multi_mapped_reads}",
                f"maximum_spliced_alignment_overhang={maximum_spliced_alignment_overhang}",
                f"annotated_junction={is_annotated}",
            ]

            if header:
                for other_columns in 'num_samples_with_this_junction', 'num_samples_total', 'max_per_sample_unique_reads', 'max_per_sample_total_reads':
                    if other_columns in header:
                        idx = header.index(other_columns)
                        output_fields.append(f"{other_columns}={float(fields[idx])}")

            gffTags = ";".join(output_fields)

            score = num_uniquely_mapped_reads

            counter += 1
            bed_file.write("\t".join(map(str, [
                chrom,
                start_1based - 1,
                end_1based,
                gffTags,
                score,
                strand,
                ])) + "\n")

    print(f"Wrote {counter} intervals to {output_path}.gz of which {annotated_counter} ({100*annotated_counter/counter:.01f}%) are known introns")

    os.system(f"bgzip -f {output_path}")
    os.system(f"tabix {output_path}.gz")
