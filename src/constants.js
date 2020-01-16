
export const SUPPORTED_FILE_EXTENSIONS = {
  '.bigWig': 'coverage',
  '.junctions.bed': 'spliceJunctions',
  '.spliceJunctions.bed': 'spliceJunctions',
  '.junctions.bed.gz': 'spliceJunctions',
  '.spliceJunctions.bed.gz': 'spliceJunctions',
  '.bam': 'bam',
  '.cram': 'bam',
  '.vcf': 'vcf',
  '.vcf.gz': 'vcf',
}

export const MOTIFS = ['GT/AG', 'CT/AC', 'GC/AG', 'CT/GC', 'AT/AC', 'GT/AT', 'non-canonical']

export const DEFAULT_COLOR_BY_NUM_READS_THRESHOLD = 5

