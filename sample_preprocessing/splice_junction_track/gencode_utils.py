import collections
import gzip


def _compute_introns_for_chrom(chrom, transcript_to_exons):
    """Utility method that converts transcript information to a list of introns.

    Args:
        chrom (str): chromosome name
        transcript_to_exons (dict): maps (transcript_id, gene_id, gene_name) keys to
            (exon_number, start_1based, end_1based, strand) values.

    Return:
        list: intron coordinates for the given transcripts
    """
    introns = []
    for exons_in_transcript in transcript_to_exons.values():
        prev_exon_3prime = None
        for exon_number, start_1based, end_1based, strand in sorted(exons_in_transcript):
            if strand == "+":
                current_exon_5prime = int(start_1based)
                if exon_number > 1:
                    assert prev_exon_3prime < current_exon_5prime
                    intron_start_1based = prev_exon_3prime + 1
                    intron_end_1based = current_exon_5prime - 1
                prev_exon_3prime = int(end_1based)
            elif strand == "-":
                current_exon_5prime = int(end_1based)
                if exon_number > 1:
                    assert prev_exon_3prime > current_exon_5prime
                    intron_start_1based = current_exon_5prime + 1
                    intron_end_1based = prev_exon_3prime - 1
                prev_exon_3prime = int(start_1based)
            else:
                print(f"ERROR: strand == {strand}")
                continue

            if exon_number > 1:
                introns.append((chrom, intron_start_1based, intron_end_1based))

    return introns


def parse_introns_from_gencode_gff(gencode_gff_path):
    """Returns a set of (chrom, start, end) 3-tuples where each tuple represents 1-based coordinates for all
    introns in the given gff file.

    Args:
        gencode_gff_path (str): Path of a gencode gff file

    Return:
          set: 3-tuples representing 1-based intron coordinates
    """
    if ".gff" not in gencode_gff_path:
        print(f"WARNING: filename doesn't contain '.gff': {gencode_gff_path}")

    print(f"Parsing: {gencode_gff_path}")
    # example line: chr1	HAVANA	exon	11869	12227	.	+	.	ID=exon:ENST00000456328.2:1;Parent=ENST00000456328.2;gene_id=ENSG00000223972.5;transcript_id=ENST00000456328.2;gene_type=transcribed_unprocessed_pseudogene;gene_name=DDX11L1;transcript_type=processed_transcript;transcript_name=DDX11L1-002;exon_number=1;exon_id=ENSE00002234944.1;level=2;transcript_support_level=1;tag=basic;havana_gene=OTTHUMG00000000961.2;havana_transcript=OTTHUMT00000362751.1
    introns = []
    with (gzip.open if gencode_gff_path.endswith("gz") else open)(gencode_gff_path, "rt") as f:
        prev_chrom = None
        transcript_to_exons = collections.defaultdict(list)
        for line in f:
            if line.startswith("#"):
                continue
            fields = line.rstrip("\n").split("\t")
            if fields[2] != "exon":
                continue
            chrom = fields[0]
            if chrom != prev_chrom:
                if prev_chrom is not None:
                    introns_for_prev_chrom = _compute_introns_for_chrom(prev_chrom, transcript_to_exons)
                    print(f"Found {len(introns_for_prev_chrom)} introns in {prev_chrom}")
                    introns.extend(introns_for_prev_chrom)
                transcript_to_exons = collections.defaultdict(list)
                prev_chrom = chrom

            start_1based = fields[3]
            end_1based = fields[4]
            strand = fields[6]
            annot = {}
            for key_value in fields[8].strip("; ").split(";"):
                if "=" in key_value:
                    key, value = key_value.split("=")
                else:
                    key = key_value
                    value = None
                annot[key] = value

            missing_keys = [f'"{k}"' for k in ("exon_number", "transcript_id", "gene_id", "gene_name") if k not in annot]
            if missing_keys:
                raise ValueError(f"Missing keys {', '.join(missing_keys)} in gff line '{line}'. \nAre you sure {gencode_gff_path} is a Gencode .gff file?")

            exon_number = annot['exon_number']
            transcript_id = annot['transcript_id'].split(".")[0]
            gene_id = annot['gene_id'].split(".")[0]
            gene_name = annot['gene_name']
            transcript_to_exons[(transcript_id, gene_id, gene_name)].append((int(exon_number), start_1based, end_1based, strand))

        introns_for_prev_chrom = _compute_introns_for_chrom(chrom, transcript_to_exons)
        print(f"Found {len(introns_for_prev_chrom)} introns on {chrom}")
        introns.extend(introns_for_prev_chrom)

    return set(introns)

