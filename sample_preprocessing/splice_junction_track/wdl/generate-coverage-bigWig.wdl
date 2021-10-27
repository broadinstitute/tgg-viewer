# Author: François Aguet

# example settings:
#   bam_file = ${STAR_OUTPUT_BAM_PATH}
#   chr_sizes = "gs://gtex-resources/references/GRCh38.chrsizes"  # this file contains the 1st 2 columns of hg38.fa.fai
#   prefix = ${SAMPLE_ID}
#   memory     = 3
#   disk_space = 60
#   num_threads = 1
#   num_preempt = 5


task bam_to_coverage {

	File bam_file
	File chr_sizes
	String prefix
	File? intervals_bed

	Int memory
	Int disk_space
	Int num_threads
	Int num_preempt

	command {
		set -euo pipefail
		python3 /src/bam2coverage.py ${bam_file} ${chr_sizes} ${prefix} ${"--intersect " + intervals_bed}
	}

	output {
		# File coverage_file = "${prefix}.coverage.gz"
		File coverage_bigwig = "${prefix}.bigWig"
	}

	runtime {
		docker: "gcr.io/broad-cga-francois-gtex/gtex_rnaseq:V9"
		memory: "${memory}GB"
		disks: "local-disk ${disk_space} HDD"
		cpu: "${num_threads}"
		preemptible: "${num_preempt}"
	}

	meta {
		author: "Francois Aguet"
	}
}


workflow bam_to_coverage_workflow {
	call bam_to_coverage
}
